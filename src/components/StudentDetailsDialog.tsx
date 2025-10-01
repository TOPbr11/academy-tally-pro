import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Mail, Phone, Calendar, GraduationCap, Hash, Clock } from "lucide-react";

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

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

const StudentDetailsDialog = ({ open, onOpenChange, student }: StudentDetailsDialogProps) => {
  if (!student) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Aluno</DialogTitle>
          <DialogDescription>Informações completas do registro</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com nome e status */}
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-xl font-semibold text-foreground">{student.full_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                <Hash className="inline w-3 h-3 mr-1" />
                {student.registration_number}
              </p>
            </div>
            <Badge
              variant={student.status === "Ativo" ? "default" : "secondary"}
              className={
                student.status === "Ativo"
                  ? "bg-success text-success-foreground text-sm px-3 py-1"
                  : "text-sm px-3 py-1"
              }
            >
              {student.status}
            </Badge>
          </div>

          {/* Informações principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span className="font-medium">E-mail</span>
              </div>
              <p className="text-foreground pl-6">{student.email}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                <span className="font-medium">Telefone</span>
              </div>
              <p className="text-foreground pl-6">{student.phone}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Data de Nascimento</span>
              </div>
              <p className="text-foreground pl-6">{formatDate(student.birth_date)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium">Curso</span>
              </div>
              <p className="text-foreground pl-6">{student.course}</p>
            </div>
          </div>

          {/* Informações de sistema */}
          <div className="pt-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                <span>Criado em: {formatDateTime(student.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Clock className="w-3 h-3" />
                <span>Última atualização: {formatDateTime(student.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailsDialog;
