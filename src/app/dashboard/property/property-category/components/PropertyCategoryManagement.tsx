"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react";
import { PropertyCategory } from "@/types/category";
import { toast } from "sonner";
import useGetCategories from "../_hooks/useGetPropertyCategories";
import useCreateCategory from "../_hooks/useCreatePropertyCategory";
import useUpdateCategory from "../_hooks/useUpdatePropertyCategory";
import useDeleteCategory from "../_hooks/useDeletePropertyCategory";


interface CategoryFormData {
  name: string;
  isActive: boolean;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<PropertyCategory[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PropertyCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<PropertyCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    isActive: true,
  });

  // Hook calls
  const { data: categoriesData, isLoading: isFetching, refetch } = useGetCategories();
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  // Update categories from real data
  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Loading state from hooks
  const isAnyLoading = isFetching || isCreating || isUpdating || isDeleting;

  const resetForm = () => {
    setFormData({ name: "", isActive: true });
    setEditingCategory(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (category: PropertyCategory) => {
    setFormData({
      name: category.name,
      isActive: category.isActive,
    });
    setEditingCategory(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (formData.name.trim().length < 2) {
      toast.error("Category name must be at least 2 characters long");
      return;
    }

    if (formData.name.trim().length > 50) {
      toast.error("Category name must not exceed 50 characters");
      return;
    }

    // Client-side duplicate check (only for create, not edit)
    if (!editingCategory) {
      const isDuplicate = categories.some(
        cat => cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        toast.error("Category name already exists. Please choose a different name.");
        return;
      }
    }

    // For edit, check if new name conflicts with other categories
    if (editingCategory) {
      const isDuplicate = categories.some(
        cat => cat.id !== editingCategory.id && 
               cat.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        toast.error("Category name already exists. Please choose a different name.");
        return;
      }
    }

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory({
          slug: editingCategory.slug,
          data: formData
        });
      } else {
        // Create new category
        await createCategory(formData);
      }

      resetForm();
      setIsCreateModalOpen(false);
      refetch(); // Refresh data
    } catch (error: any) {
      // Error already handled in hooks with detailed messages
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.slug);
      setDeletingCategory(null);
      refetch(); // Refresh data
    } catch (error: any) {
      // Error already handled in hooks
    }
  };

  const handleToggleStatus = async (category: PropertyCategory) => {
    try {
      await updateCategory({
        slug: category.slug,
        data: { isActive: !category.isActive }
      });
      refetch(); // Refresh data
    } catch (error: any) {
      // Error already handled in hooks
    }
  };

  // Loading screen
  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground">Manage your property categories</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={isCreating}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsCreateModalOpen(false);
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Categories Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first property category to get started
              </p>
              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Slug: {category.slug} • {category._count?.properties || 0} properties
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Badge variant={category.isActive ? "default" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`switch-${category.id}`} className="text-sm">
                      {category.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`switch-${category.id}`}
                      checked={category.isActive}
                      onCheckedChange={() => handleToggleStatus(category)}
                      disabled={isUpdating}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditModal(category)}
                    disabled={isAnyLoading}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingCategory(category)}
                    disabled={isAnyLoading || Boolean(category._count?.properties && category._count.properties > 0)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                required
                disabled={isUpdating}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                disabled={isUpdating}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
              {deletingCategory?._count?.properties && deletingCategory._count.properties > 0 && (
                <span className="block text-destructive mt-2 font-medium">
                  This category is being used by {deletingCategory._count.properties} properties and cannot be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || Boolean(deletingCategory?._count?.properties && deletingCategory._count.properties > 0)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}