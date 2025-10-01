import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Users,
} from "lucide-react";
import StudentFormDialog from "@/components/StudentFormDialog";
import StudentDetailsDialog from "@/components/StudentDetailsDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";

interface Profile {
  role: string;
}

interface Student {
  id: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  course: string;
  registration_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    // Configurar listener de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    // Filtrar alunos baseado na busca
    if (searchTerm) {
      const filtered = students.filter(
        (student) =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return;
    }

    setProfile(data);
  };

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar alunos");
      console.error(error);
    } else {
      setStudents(data || []);
      setFilteredStudents(data || []);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir aluno");
      console.error(error);
    } else {
      toast.success("Aluno excluído com sucesso");
      fetchStudents();
      setDeleteOpen(false);
      setSelectedStudent(null);
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Alunos</h1>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Administrador" : "Usuário"}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Card */}
        <Card className="mb-6 shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-3xl font-bold text-primary">{students.length}</p>
              </div>
              <div className="bg-success/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-3xl font-bold text-success">
                  {students.filter((s) => s.status === "Ativo").length}
                </p>
              </div>
              <div className="bg-destructive/5 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-3xl font-bold text-destructive">
                  {students.filter((s) => s.status === "Inativo").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Actions */}
        <Card className="mb-6 shadow-lg border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, matrícula ou curso..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {isAdmin && (
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Aluno
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle>Lista de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum aluno encontrado
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{student.registration_number}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={student.status === "Ativo" ? "default" : "secondary"}
                            className={
                              student.status === "Ativo"
                                ? "bg-success text-success-foreground"
                                : ""
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedStudent(student);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setFormOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setDeleteOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <StudentFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          fetchStudents();
          setFormOpen(false);
          setSelectedStudent(null);
        }}
      />

      <StudentDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        student={selectedStudent}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => selectedStudent && handleDelete(selectedStudent.id)}
        studentName={selectedStudent?.full_name || ""}
      />
    </div>
  );
};

export default Dashboard;
