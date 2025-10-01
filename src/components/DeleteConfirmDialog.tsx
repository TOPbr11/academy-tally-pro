import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  studentName: string;
}

const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  studentName,
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Tem certeza que deseja excluir o aluno{" "}
            <span className="font-semibold text-foreground">{studentName}</span>?
            <br />
            <span className="text-destructive">Esta ação não pode ser desfeita.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
