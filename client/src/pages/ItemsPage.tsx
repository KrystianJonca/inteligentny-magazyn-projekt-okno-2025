import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getItems, deleteItem as apiDeleteItem } from '@/api/item';
import type { ItemReadWithInventory, PaginatedItems } from '@/api/schema.types';
import { ItemDialog } from '@/components/items/ItemDialog';
import { ItemStockManagementDialog } from '@/components/items/ItemStockManagementDialog';
import { ItemTable } from '@/components/items/ItemTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEFAULT_PAGE_SIZE = 10;

export function ItemsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [selectedItemForForm, setSelectedItemForForm] = useState<ItemReadWithInventory | null>(
    null
  );

  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [itemForStockManagement, setItemForStockManagement] =
    useState<ItemReadWithInventory | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('page_size') || String(DEFAULT_PAGE_SIZE), 10);
  const searchTerm = searchParams.get('search') || '';

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const {
    data: paginatedItems,
    isLoading,
    error,
  } = useQuery<PaginatedItems, Error>({
    queryKey: ['items', { page, pageSize, search: searchTerm }],
    queryFn: () => getItems({ page, page_size: pageSize, search: searchTerm }),
    placeholderData: (previousData: PaginatedItems | undefined) => previousData,
  });

  const items = paginatedItems?.items || [];
  const pageInfo = paginatedItems?.page_info;

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(prev => {
        prev.set('search', localSearchTerm);
        prev.set('page', '1');
        if (!localSearchTerm) prev.delete('search');
        return prev;
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearchTerm, setSearchParams]);

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: apiDeleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      console.log('Item deleted successfully!');
    },
    onError: err => {
      console.error('Error deleting item:', err);
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedItemForForm(null);
    setIsItemFormOpen(true);
  };

  const handleEditItem = (item: ItemReadWithInventory) => {
    setSelectedItemForForm(item);
    setIsItemFormOpen(true);
  };

  const handleDeleteItem = (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(itemId);
    }
  };

  const handleManageStock = (item: ItemReadWithInventory) => {
    setItemForStockManagement(item);
    setIsStockDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  if (isLoading && !paginatedItems)
    return <div className="container mx-auto py-10">Loading items...</div>;
  if (error)
    return <div className="container mx-auto py-10">Error fetching items: {error.message}</div>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Items</h1>
        <Button onClick={handleOpenCreateDialog}>Add Item</Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search items by name..."
          value={localSearchTerm}
          onChange={e => setLocalSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && items.length === 0 && <p>Loading items...</p>}
      {!isLoading && items.length === 0 && searchTerm && <p>No items found for "{searchTerm}".</p>}
      {!isLoading && items.length === 0 && !searchTerm && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No items found.</p>
          <Button onClick={handleOpenCreateDialog}>Add Item</Button>
        </div>
      )}
      {items.length > 0 && (
        <ItemTable
          items={items}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onManageStock={handleManageStock}
        />
      )}
      {isLoading && items.length > 0 && (
        <p className="text-center py-4 text-sm text-muted-foreground">Updating item list...</p>
      )}

      {pageInfo && pageInfo.total_pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <Button onClick={() => handlePageChange(page - 1)} disabled={page <= 1} variant="outline">
            Previous
          </Button>
          <span>
            Page {pageInfo.page} of {pageInfo.total_pages}
          </span>
          <Button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pageInfo.has_next_page}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}

      <ItemDialog
        isOpen={isItemFormOpen}
        onClose={() => setIsItemFormOpen(false)}
        item={selectedItemForForm}
        onSuccess={() => {
          setIsItemFormOpen(false);
        }}
      />

      {itemForStockManagement && (
        <ItemStockManagementDialog
          isOpen={isStockDialogOpen}
          onClose={() => setIsStockDialogOpen(false)}
          item={itemForStockManagement}
        />
      )}
    </div>
  );
}
