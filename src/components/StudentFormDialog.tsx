import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { z } from "zod";

const studentSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  email: z.string().email("E-mail inválido").max(255),
  phone: z.string().min(10, "Telefone inválido").max(20),
  course: z.string().min(3, "Curso é obrigatório").max(100),
  registration_number: z.string().min(3, "Matrícula é obrigatória").max(50),
  status: z.enum(["Ativo", "Inativo"]),
});

interface Student {
  id: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  course: string;
  registration_number: string;
  status: string;
}

interface StudentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess: () => void;
}

const StudentFormDialog = ({ open, onOpenChange, student, onSuccess }: StudentFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_date: "",
    email: "",
    phone: "",
    course: "",
    registration_number: "",
    status: "Ativo",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name,
        birth_date: student.birth_date,
        email: student.email,
        phone: student.phone,
        course: student.course,
        registration_number: student.registration_number,
        status: student.status,
      });
    } else {
      setFormData({
        full_name: "",
        birth_date: "",
        email: "",
        phone: "",
        course: "",
        registration_number: "",
        status: "Ativo",
      });
    }
  }, [student, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      studentSchema.parse(formData);
      setLoading(true);

      if (student) {
        // Atualizar aluno existente
        const { error } = await supabase
          .from("students")
          .update(formData)
          .eq("id", student.id);

        if (error) throw error;
        toast.success("Aluno atualizado com sucesso!");
      } else {
        // Criar novo aluno
        const { error } = await supabase.from("students").insert([formData]);

        if (error) throw error;
        toast.success("Aluno cadastrado com sucesso!");
      }

      onSuccess();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Erro ao salvar aluno");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{student ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
          <DialogDescription>
            {student
              ? "Atualize as informações do aluno abaixo."
              : "Preencha os dados do novo aluno."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento *</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Matrícula *</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({ ...formData, registration_number: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
              <Input
                id="course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : student ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
