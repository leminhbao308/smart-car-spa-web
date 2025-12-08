"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { App } from "antd";
import { categoryService } from "../services/category.service";

// Helper hook to get message API from App context
const useAppMessage = () => {
  try {
    const { message } = App.useApp();
    return message;
  } catch {
    // Fallback if not within App context (shouldn't happen in normal usage)
    return null;
  }
};
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
  const message = useAppMessage();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message?.success("Tạo danh mục thành công!");
    },
    onError: () => {
      message?.error("Có lỗi xảy ra khi tạo danh mục");
    },
  });
};

// Hook để cập nhật category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: (data: UpdateCategoryRequest) => {
      const { category_id, ...updateData } = data;
      return categoryService.updateCategory(category_id, updateData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({
        queryKey: ["category", variables.category_id],
      });
      message?.success("Cập nhật danh mục thành công!");
    },
    onError: () => {
      message?.error("Có lỗi xảy ra khi cập nhật danh mục");
    },
  });
};

// Hook để xóa category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message?.success("Xóa danh mục thành công!");
    },
    onError: () => {
      message?.error("Có lỗi xảy ra khi xóa danh mục");
    },
  });
};

// Hook để toggle status category (sử dụng API cũ)
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

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
      message?.success("Cập nhật trạng thái thành công!");
    },
    onError: () => {
      message?.error("Có lỗi xảy ra khi cập nhật trạng thái");
    },
  });
};

// Hook để cập nhật status category (sử dụng API /categories/{id}/status)
export const useUpdateCategoryStatus = () => {
  const queryClient = useQueryClient();
  const message = useAppMessage();

  return useMutation({
    mutationFn: ({ categoryId, isActive }: { categoryId: string; isActive: boolean }) =>
      categoryService.toggleCategoryStatus(categoryId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      message?.success("Cập nhật trạng thái thành công!");
    },
    onError: () => {
      message?.error("Có lỗi xảy ra khi cập nhật trạng thái");
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
// Backend chỉ trả về children (level 1+), parents (level 0) có trong breadcrumb
const buildCategoryTree = (categories: Category[]): CategoryTreeNode[] => {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];
  const parentCategoryTypes = new Map<string, string>(); // Map để lưu category_type của parent từ children

  // Bước 1: Collect category_type của parents từ children
  categories.forEach((category) => {
    if (category.parent_category_id) {
      // Lưu category_type của parent (thường parent và children có cùng type)
      if (!parentCategoryTypes.has(category.parent_category_id)) {
        parentCategoryTypes.set(category.parent_category_id, category.category_type);
      }
    }
  });

  // Bước 2: Extract parent categories từ breadcrumb và thêm vào map
  categories.forEach((category) => {
    if (category.breadcrumb && category.breadcrumb.length > 0) {
      // Lấy parent categories từ breadcrumb (tất cả items trừ item cuối cùng là chính category này)
      category.breadcrumb.forEach((breadcrumbItem, index) => {
        // Item cuối cùng trong breadcrumb là chính category hiện tại, bỏ qua
        if (index < category.breadcrumb.length - 1) {
          const parentId = breadcrumbItem.category_id;
          
          // Chỉ tạo parent node nếu chưa có trong map
          if (!categoryMap.has(parentId)) {
            // Tạo parent node từ breadcrumb data
            const parentNode: CategoryTreeNode = {
              category_id: breadcrumbItem.category_id,
              category_code: `CAT_${parentId.substring(0, 8)}`, // Generate code từ ID
              category_name: breadcrumbItem.category_name,
              category_url: breadcrumbItem.category_url,
              parent_category_id: breadcrumbItem.parent_category_id,
              description: null,
              category_type: (parentCategoryTypes.get(parentId) || "PRODUCT") as "PRODUCT" | "SERVICE" | "PROMOTION" | "OTHER",
              level: breadcrumbItem.level,
              sort_order: 0,
              subcategories: [],
              breadcrumb: category.breadcrumb.slice(0, index + 1), // Breadcrumb đến level này
              created_date: breadcrumbItem.created_date,
              modified_date: breadcrumbItem.modified_date,
              created_by: breadcrumbItem.created_by,
              modified_by: breadcrumbItem.modified_by,
              is_active: breadcrumbItem.is_active,
              is_deleted: breadcrumbItem.is_deleted,
              key: parentId,
              children: [],
            };
            
            categoryMap.set(parentId, parentNode);
          }
        }
      });
    }
  });

  // Bước 3: Thêm tất cả categories từ content vào map
  categories.forEach((category) => {
    if (!categoryMap.has(category.category_id)) {
      categoryMap.set(category.category_id, {
        ...category,
        key: category.category_id,
        level: category.level || 0,
        children: [],
      });
    } else {
      // Nếu đã có trong map (từ breadcrumb), merge data
      const existingNode = categoryMap.get(category.category_id)!;
      categoryMap.set(category.category_id, {
        ...existingNode,
        ...category,
        key: category.category_id,
        children: existingNode.children || [],
        // Giữ lại breadcrumb từ existing node nếu đầy đủ hơn
        breadcrumb: existingNode.breadcrumb.length >= category.breadcrumb.length 
          ? existingNode.breadcrumb 
          : category.breadcrumb,
      });
    }
  });

  // Bước 4: Xây dựng tree structure
  categoryMap.forEach((treeNode, categoryId) => {
    if (treeNode.parent_category_id) {
      // Có parent - tìm parent và thêm vào children
      const parentNode = categoryMap.get(treeNode.parent_category_id);
      if (parentNode) {
        parentNode.children = parentNode.children || [];
        // Kiểm tra xem đã có trong children chưa để tránh duplicate
        if (!parentNode.children.find(child => child.category_id === categoryId)) {
          parentNode.children.push(treeNode);
        }
      } else {
        // Parent không tồn tại trong map - đây là root category (không nên xảy ra)
        console.warn(`Parent ${treeNode.parent_category_id} not found for category ${categoryId}`);
        if (!rootCategories.find(root => root.category_id === categoryId)) {
          rootCategories.push(treeNode);
        }
      }
    } else {
      // Không có parent - đây là root category
      if (!rootCategories.find(root => root.category_id === categoryId)) {
        rootCategories.push(treeNode);
      }
    }
  });

  // Bước 5: Sort children by sort_order hoặc category_name
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

