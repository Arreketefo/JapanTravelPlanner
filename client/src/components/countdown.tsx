import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

type CountdownProps = {
  targetDate: string;
};

const timeUnitLabels = {
  days: "días",
  hours: "horas",
  minutes: "minutos",
  seconds: "segundos"
};

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate);

    const updateCountdown = () => {
      const now = new Date();

      setTimeLeft({
        days: differenceInDays(target, now),
        hours: differenceInHours(target, now) % 24,
        minutes: differenceInMinutes(target, now) % 60,
        seconds: differenceInSeconds(target, now) % 60,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-2xl font-bold">Tiempo Hasta Japón</h2>
      <div className="flex gap-4">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <Card key={unit}>
            <CardContent className="flex flex-col items-center p-4">
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground">{timeUnitLabels[unit as keyof typeof timeUnitLabels]}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}