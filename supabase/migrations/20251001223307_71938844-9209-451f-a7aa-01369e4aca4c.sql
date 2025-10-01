-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Criar tabela de alunos
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  registration_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para students - todos usuários autenticados podem visualizar
CREATE POLICY "Usuários autenticados podem visualizar alunos"
  ON public.students FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem inserir alunos
CREATE POLICY "Admins podem inserir alunos"
  ON public.students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas admins podem atualizar alunos
CREATE POLICY "Admins podem atualizar alunos"
  ON public.students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas admins podem deletar alunos
CREATE POLICY "Admins podem deletar alunos"
  ON public.students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Índices para melhorar performance
CREATE INDEX idx_students_registration_number ON public.students(registration_number);
CREATE INDEX idx_students_email ON public.students(email);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_students_course ON public.students(course);