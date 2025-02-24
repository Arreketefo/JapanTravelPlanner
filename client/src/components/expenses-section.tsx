import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { type Expense } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

const YEN_TO_EUR = 0.00625;

const formSchema = z.object({
  concept: z.string().min(1, "Por favor ingresa un concepto para el gasto")
    .max(100, "El concepto no puede tener más de 100 caracteres"),
  amountEur: z.string()
    .min(1, "Por favor ingresa un importe")
    .transform((val) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) throw new Error("El importe debe ser un número válido (por ejemplo: 10.50)");
      if (parsed <= 0) throw new Error("El importe debe ser mayor que 0");
      if (parsed > 100000) throw new Error("El importe parece demasiado alto. Si es correcto, por favor divide el gasto en partes más pequeñas.");
      return parsed;
    })
});

type FormData = z.infer<typeof formSchema>;

export default function ExpensesSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concept: "",
      amountEur: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const amountInYen = Math.floor(data.amountEur / YEN_TO_EUR);

      const res = await apiRequest("POST", "/api/expenses", {
        concept: data.concept,
        amount: amountInYen
      });

      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = await res.json();
          if (errorData.issues) {
            errorMessage = errorData.issues.map((issue: any) => {
              if (issue.code === "invalid_type" && issue.path[0] === "amount") {
                return "El importe debe ser un número válido";
              }
              if (issue.code === "too_small" && issue.path[0] === "amount") {
                return "El importe debe ser mayor que 0 yenes";
              }
              return issue.message;
            }).join(". ");
          } else {
            errorMessage = errorData.message || "No se pudo guardar el gasto. Por favor revisa los datos e intenta nuevamente.";
          }
        } catch (e) {
          errorMessage = "Hubo un problema al procesar tu solicitud. Por favor intenta nuevamente.";
        }
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: (newExpense: Expense) => {
      queryClient.setQueryData<Expense[]>(["/api/expenses"], (old = []) => [
        newExpense,
        ...old,
      ]);
      form.reset();
      toast({
        title: "¡Gasto registrado correctamente!",
        description: `Se ha registrado el gasto "${newExpense.concept}" por un valor de €${(newExpense.amount * YEN_TO_EUR).toFixed(2)}`,
      });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "No se pudo registrar el gasto",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (expense: Expense) => {
      const res = await apiRequest("DELETE", `/api/expenses/${expense.id}`);
      if (!res.ok) {
        throw new Error("No se pudo eliminar el gasto");
      }
      return expense;
    },
    onSuccess: (deletedExpense) => {
      queryClient.setQueryData<Expense[]>(["/api/expenses"], (old = []) =>
        old.filter(expense => expense.id !== deletedExpense.id)
      );

      toast({
        title: "Gasto eliminado",
        description: `Se ha eliminado el gasto "${deletedExpense.concept}"`,
      });

      setExpenseToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar el gasto",
        description: error.message,
        variant: "destructive",
      });
      setExpenseToDelete(null);
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    mutation.mutate(data);
  }

  const totalInYen = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const totalInEur = totalInYen * YEN_TO_EUR;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos del Viaje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="concept"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Hotel en Tokyo"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amountEur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agregando gasto...
                  </>
                ) : (
                  "Agregar Gasto"
                )}
              </Button>
            </form>
          </Form>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay gastos registrados aún
            </p>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{expense.concept}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.date!).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            €{(expense.amount * YEN_TO_EUR).toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ¥{expense.amount.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setExpenseToDelete(expense)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">Total</p>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      €{totalInEur.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ¥{totalInYen.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog
        open={expenseToDelete !== null}
        onOpenChange={(open) => !open && setExpenseToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el gasto "{expenseToDelete?.concept}" por un valor de €{((expenseToDelete?.amount || 0) * YEN_TO_EUR).toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (expenseToDelete) {
                  deleteMutation.mutate(expenseToDelete);
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}