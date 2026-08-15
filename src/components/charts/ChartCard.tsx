import React from "react";
import { Card } from "@/components/ui/card";
import Skeleton from "@/components/ui/skeleton/Skeleton";

interface ChartCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: Error | null;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, isLoading, error, children }) => (
  <Card variant="outlined">
    <Card.Header>
      <Card.Title>{title}</Card.Title>
      {description && <Card.Description>{description}</Card.Description>}
    </Card.Header>
    <Card.Body>
      {error ? (
        <p className="text-sm text-red-500 py-8 text-center">No se pudo cargar la información.</p>
      ) : isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        children
      )}
    </Card.Body>
  </Card>

  
);

export default ChartCard;