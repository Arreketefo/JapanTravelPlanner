import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, ThumbsUp, Sun, Moon } from "lucide-react";
import SuggestionForm from "./suggestion-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { Suggestion as SuggestionType } from "@shared/schema";

type CityName = "osaka" | "kyoto" | "tokyo";

type CityProps = {
  city: CityName;
  days: number;
};

type Suggestion = SuggestionType & {
  votes: number;
  period: "morning" | "afternoon"; // Added period property
};

const cityNames = {
  osaka: "Osaka",
  kyoto: "Kyoto",
  tokyo: "Tokyo"
};

type GroupedSuggestions = {
  [key: number]: {
    morning: Suggestion[];
    afternoon: Suggestion[];
  };
};

export default function CitySection({ city, days }: CityProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: suggestions = [], isLoading } = useQuery<Suggestion[]>({
    queryKey: [`/api/suggestions/${city}`],
  });

  const voteMutation = useMutation({
    mutationFn: async (suggestionId: number) => {
      const res = await apiRequest("POST", "/api/votes", { suggestionId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/suggestions/${city}`] });
      toast({
        title: "Éxito",
        description: "Voto registrado correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Agrupar sugerencias por día y período
  const groupedSuggestions = suggestions.reduce<GroupedSuggestions>((acc, suggestion) => {
    if (!acc[suggestion.day]) {
      acc[suggestion.day] = {
        morning: [],
        afternoon: []
      };
    }

    if (suggestion.period === "morning") {
      acc[suggestion.day].morning.push(suggestion);
    } else {
      acc[suggestion.day].afternoon.push(suggestion);
    }

    // Ordenar por votos dentro de cada período
    acc[suggestion.day].morning.sort((a, b) => b.votes - a.votes);
    acc[suggestion.day].afternoon.sort((a, b) => b.votes - a.votes);

    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{cityNames[city]}</CardTitle>
          <p className="text-sm text-muted-foreground">{days} días</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Sugerencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SuggestionForm city={city} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay sugerencias aún. ¡Sé el primero en agregar una!
          </p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSuggestions).map(([day, periods]) => (
              <div key={day} className="space-y-6">
                <h3 className="font-semibold text-lg">Día {day}</h3>

                {/* Sección Mañana */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Sun className="h-4 w-4" />
                    Mañana
                  </div>
                  {periods.morning.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold">{suggestion.placeName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            {suggestion.link && (
                              <a
                                href={suggestion.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                Más información
                              </a>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary">{suggestion.votes} votos</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => voteMutation.mutate(suggestion.id)}
                              disabled={voteMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Votar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Sección Tarde */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Moon className="h-4 w-4" />
                    Tarde
                  </div>
                  {periods.afternoon.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold">{suggestion.placeName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {suggestion.description}
                            </p>
                            {suggestion.link && (
                              <a
                                href={suggestion.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-2 inline-block"
                              >
                                Más información
                              </a>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary">{suggestion.votes} votos</Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => voteMutation.mutate(suggestion.id)}
                              disabled={voteMutation.isPending}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Votar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}