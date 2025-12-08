import { useState, useCallback } from "react";
import { ServicePackage } from "@/lib/api/types/service-package.types";

interface UseServicePackageDetailModalReturn {
  isModalVisible: boolean;
  data: ServicePackage | null;
  showDetailModal: (data: ServicePackage) => void;
  hideModal: () => void;
}

export const useServicePackageDetailModal = (): UseServicePackageDetailModalReturn => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState<ServicePackage | null>(null);

  const showDetailModal = useCallback((packageData: ServicePackage) => {
    setData(packageData);
    setIsModalVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    setData(null);
  }, []);

  return {
    isModalVisible,
    data,
    showDetailModal,
    hideModal,
  };
};
