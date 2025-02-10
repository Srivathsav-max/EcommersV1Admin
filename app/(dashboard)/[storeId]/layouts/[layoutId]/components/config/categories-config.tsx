"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GripHorizontal, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "react-hot-toast";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";

interface Taxon {
  id: string;
  name: string;
  description?: string;
  permalink?: string;
  _count?: {
    children: number;
    products: number;
  };
}

interface CategoriesConfigProps {
  form: UseFormReturn<any>;
  categories: Taxon[];
}

const displayStyles = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "carousel", label: "Carousel" },
] as const;

export const CategoriesConfig = ({
  form,
  categories
}: CategoriesConfigProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const selectedIds = form.watch("config.categoryIds") || [];
  const selectedTaxons = categories.filter(taxon => selectedIds.includes(taxon.id));
  
  const filteredCategories = categories.filter(taxon => 
    taxon.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedIds.includes(taxon.id)
  );

  const handleSelect = (taxonId: string) => {
    try {
      setIsLoading(true);
      const currentIds = (form.getValues("config.categoryIds") || []) as string[];
      const newIds = [...currentIds, taxonId];
      
      form.setValue("config.categoryIds", newIds, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    } catch (error) {
      console.error('Error selecting taxon:', error);
      toast.error("Failed to select category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (taxonId: string) => {
    try {
      setIsLoading(true);
      const currentIds = (form.getValues("config.categoryIds") || []) as string[];
      const newIds = currentIds.filter(id => id !== taxonId);
      
      form.setValue("config.categoryIds", newIds, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    } catch (error) {
      console.error('Error removing taxon:', error);
      toast.error("Failed to remove category");
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    try {
      setIsLoading(true);
      const items = Array.from(selectedIds);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      
      form.setValue("config.categoryIds", items, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error("Failed to reorder categories");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="config.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Section Title</FormLabel>
            <FormControl>
              <Input placeholder="Shop by Category" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-6">
        <Card className="col-span-2 md:col-span-1">
          <div className="p-4 border-b">
            <div className="font-medium mb-2">Available Categories</div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-2">
              {filteredCategories.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  {searchQuery ? "No categories found" : "No categories available"}
                </div>
              ) : (
                filteredCategories.map(taxon => (
                  <div
                    key={taxon.id}
                    className={cn(
                      "group flex items-center justify-between p-2 rounded-lg",
                      "border border-transparent hover:border-primary hover:bg-accent",
                      "transition-all cursor-pointer"
                    )}
                    onClick={() => handleSelect(taxon.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{taxon.name}</div>
                      {taxon._count && (
                        <div className="text-sm text-muted-foreground">
                          {taxon._count.products} products
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="font-medium">Selected Categories</div>
              <div className="text-sm text-muted-foreground">
                {selectedTaxons.length} selected
              </div>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="selected-categories">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="h-[400px]"
                >
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-2">
                      {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : selectedTaxons.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                          No categories selected
                        </div>
                      ) : (
                        selectedTaxons.map((taxon, index) => (
                          <Draggable
                            key={taxon.id}
                            draggableId={taxon.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-lg",
                                  "bg-accent/50 border border-accent-foreground/10",
                                  "group hover:border-destructive/50 transition-all"
                                )}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab opacity-50 hover:opacity-100"
                                >
                                  <GripHorizontal className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium truncate">
                                    {taxon.name}
                                  </div>
                                  {taxon._count && (
                                    <div className="text-sm text-muted-foreground">
                                      {taxon._count.products} products
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(taxon.id);
                                  }}
                                  className="opacity-50 hover:opacity-100 hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="config.displayStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Style</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {displayStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.itemsPerRow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items per Row</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={2}
                  max={6}
                  placeholder="4"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
