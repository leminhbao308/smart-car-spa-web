"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { categoryService } from "../services/category.service";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryTreeNode,
} from "../types/category.types";

// Hook để lấy danh sách categories
export const useCategories = (page: number = 0, size: number = 50) => {
  return useQuery({
    queryKey: ["categories", page, size],
    queryFn: () => categoryService.getAllCategories(page, size),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook để lấy category theo ID
export const useCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => categoryService.getCategoryById(categoryId),
    enabled: !!categoryId,
  });
};

// Hook để tạo category mới
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Tạo danh mục thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi tạo danh mục");
    },
  });
};

// Hook để cập nhật category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) =>
      categoryService.updateCategory(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: ["category", variables.category_id],
      });
      message.success("Cập nhật danh mục thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật danh mục");
    },
  });
};

// Hook để xóa category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Xóa danh mục thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi xóa danh mục");
    },
  });
};

// Hook để toggle status category (sử dụng API cũ)
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      isActive,
    }: {
      categoryId: string;
      isActive: boolean;
    }) => categoryService.toggleCategoryStatus(categoryId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Cập nhật trạng thái thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    },
  });
};

// Hook để cập nhật status category (sử dụng API /categories/{id}/status)
export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) =>
      categoryService.toggleCategoryStatus(categoryId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message.success("Cập nhật trạng thái thành công!");
    },
    onError: () => {
      message.error("Có lỗi xảy ra khi cập nhật trạng thái");
    },
  });
};

// Hook để chuyển đổi categories thành tree structure
export const useCategoriesTree = () => {
  const { data: categoriesData, isLoading, error } = useCategories(0, 1000);

  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);

  useEffect(() => {
    if (categoriesData?.data?.content) {
      console.log('Raw categories data:', categoriesData.data.content);
      
      // Build tree structure từ flat array
      const tree = buildCategoryTree(categoriesData.data.content);
      console.log('Built tree structure:', tree);
      setTreeData(tree);
    }
  }, [categoriesData]);

  return {
    treeData,
    isLoading,
    error,
    refetch: () => {
      // Refetch logic if needed
    },
  };
};

// Helper function để build tree structure từ flat array
const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  // Tạo map và convert tất cả categories sang CategoryTreeNode
  categories.forEach((category) => {
    categoryMap.set(category.category_id, {
      ...category,
      key: category.category_id,
      level: category.level || 0,
      children: [],
    });
  });

  // Xây dựng tree structure
  categories.forEach((category) => {
    const treeNode = categoryMap.get(category.category_id)!;

    console.log(`Processing category: ${category.category_name} (ID: ${category.category_id}, Level: ${category.level}, Parent ID: ${category.parent_category_id})`);

    if (category.parent_category_id) {
      // Có parent - tìm parent và thêm vào children
      const parentNode = categoryMap.get(category.parent_category_id);
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        parentNode.children.push(treeNode);
        console.log(`  -> Added as child of ${parentNode.category_name}`);
      } else {
        // Parent không tồn tại trong data, treat as root
        console.warn(`Parent category ${category.parent_category_id} not found for category ${category.category_id}`);
        rootCategories.push(treeNode);
      }
    } else {
      // Không có parent - đây là root category
      console.log(`  -> Added as root category`);
      rootCategories.push(treeNode);
    }
  });

  // Sort children by sort_order hoặc category_name
  const sortChildren = (nodes: CategoryTreeNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.sort_order !== undefined && b.sort_order !== undefined) {
            return a.sort_order - b.sort_order;
          }
          return a.category_name.localeCompare(b.category_name);
        });
        sortChildren(node.children);
      }
    });
  };

  sortChildren(rootCategories);
  rootCategories.sort((a, b) => {
    if (a.sort_order !== undefined && b.sort_order !== undefined) {
      return a.sort_order - b.sort_order;
    }
    return a.category_name.localeCompare(b.category_name);
  });

  return rootCategories;
};

