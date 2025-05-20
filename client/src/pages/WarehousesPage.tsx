import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { WarehouseRead } from '@/api/schema.types';
import { getWarehouses, deleteWarehouse as apiDeleteWarehouse } from '@/api/warehouse';
import { Button } from '@/components/ui/button';
import { WarehouseDialog } from '@/components/warehouses/WarehouseDialog';
import { WarehouseTable } from '@/components/warehouses/WarehouseTable';

export function WarehousesPage() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseRead | null>(null);

  const {
    data: warehouses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
  });

  const deleteMutation = useMutation({
    mutationFn: apiDeleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      console.log('Warehouse deleted successfully!');
    },
    onError: err => {
      console.error('Error deleting warehouse:', err);
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedWarehouse(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (warehouse: WarehouseRead) => {
    setSelectedWarehouse(warehouse);
    setIsDialogOpen(true);
  };

  const handleDelete = (warehouseId: number) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      deleteMutation.mutate(warehouseId);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedWarehouse(null);
  };

  const handleDialogSuccess = () => {
    setIsDialogOpen(false);
    setSelectedWarehouse(null);
    console.log('Warehouse operation successful, dialog closed.');
  };

  if (isLoading) return <div className="container mx-auto py-10">Loading warehouses...</div>;
  if (error)
    return (
      <div className="container mx-auto py-10">Error fetching warehouses: {error.message}</div>
    );

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Warehouses</h1>
        <Button onClick={handleOpenCreateDialog}>Add Warehouse</Button>
      </div>

      <WarehouseTable warehouses={warehouses || []} onEdit={handleEdit} onDelete={handleDelete} />

      <WarehouseDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        warehouse={selectedWarehouse}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
