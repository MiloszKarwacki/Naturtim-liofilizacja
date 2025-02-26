"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { Delivery } from "../types";

interface RecentDeliveriesProps {
  deliveries: Delivery[];
}

export const RecentDeliveries: React.FC<RecentDeliveriesProps> = ({
  deliveries
}) => {
  const recent = [...deliveries]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 4);

  return (
    <Card className="mb-6">
      <CardHeader>
        <h5 className="text-xl font-medium">Ostatnie przyjęcia dostawy</h5>
      </CardHeader>
      <CardContent className="bg-muted/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numer partii</TableHead>
              <TableHead>Nazwa produktu</TableHead>
              <TableHead>Ilość (kg)</TableHead>
              <TableHead>Data przyjęcia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.map(delivery =>
              <TableRow key={`recent-${delivery.id}`}>
                <TableCell>
                  {delivery.batchNumber}
                </TableCell>
                <TableCell>
                  {delivery.product.name}
                </TableCell>
                <TableCell>
                  {delivery.mroznia} kg
                </TableCell>
                <TableCell>
                  {new Date(delivery.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
