import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import type { WarehouseRead } from '@/api/schema.types';
import { getWarehouses, deleteWarehouse as apiDeleteWarehouse } from '@/api/warehouse';
import { Button } from '@/components/ui/button';
import { WarehouseDialog } from '@/components/warehouses/WarehouseDialog';
import { WarehouseInventoryDialog } from '@/components/warehouses/WarehouseInventoryDialog';
import { WarehouseTable } from '@/components/warehouses/WarehouseTable';

export function WarehousesPage() {
  const queryClient = useQueryClient();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedWarehouseForForm, setSelectedWarehouseForForm] = useState<WarehouseRead | null>(
    null
  );
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);
  const [selectedWarehouseForInventory, setSelectedWarehouseForInventory] =
    useState<WarehouseRead | null>(null);

  const {
    data: warehousesData,
    isLoading,
    error,
  } = useQuery<WarehouseRead[], Error>({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
  });
  const warehouses = warehousesData || [];

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: apiDeleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      toast.success('Warehouse deleted successfully!');
    },
    onError: err => {
      toast.error(`Error deleting warehouse: ${err.message}`);
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedWarehouseForForm(null);
    setIsFormDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseRead) => {
    setSelectedWarehouseForForm(warehouse);
    setIsFormDialogOpen(true);
  };

  const handleDeleteWarehouse = (warehouseId: number) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      deleteMutation.mutate(warehouseId);
    }
  };

  const handleManageInventory = (warehouse: WarehouseRead) => {
    setSelectedWarehouseForInventory(warehouse);
    setIsInventoryDialogOpen(true);
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

      <WarehouseTable
        warehouses={warehouses}
        onEdit={handleEditWarehouse}
        onDelete={handleDeleteWarehouse}
        onManageInventory={handleManageInventory}
      />

      <WarehouseDialog
        isOpen={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        warehouse={selectedWarehouseForForm}
        onSuccess={() => {
          setIsFormDialogOpen(false);
        }}
      />

      {selectedWarehouseForInventory && (
        <WarehouseInventoryDialog
          isOpen={isInventoryDialogOpen}
          onClose={() => setIsInventoryDialogOpen(false)}
          warehouse={selectedWarehouseForInventory}
        />
      )}
    </div>
  );
}
