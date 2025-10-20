/**
 * Booking Inventory Management Service
 * Handles inventory operations for booking services
 */

import apiClient from "../axios";
import { ServiceService } from "./service.service";
import { InventoryService } from "./inventory.service";
import { Service, ServiceProduct } from "../types/service.types";
import { BookingInfoDto } from "../types/booking.types";

export interface BookingInventoryItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  isRequired: boolean;
  serviceId: string;
  serviceName: string;
}

export class BookingInventoryService {
  /**
   * Get all required products for a booking
   */
  static async getBookingRequiredProducts(booking: BookingInfoDto): Promise<BookingInventoryItem[]> {
    console.log("🔍 Getting required products for booking:", booking.booking_id);
    
    const inventoryItems: BookingInventoryItem[] = [];
    
    try {
      // Process each booking item (service)
      for (const bookingItem of booking.booking_items) {
        if (!bookingItem.service_id) {
          console.warn("⚠️ Booking item missing service_id:", bookingItem);
          continue;
        }
        
        console.log(`🔍 Processing service: ${bookingItem.service_id} (${bookingItem.item_name})`);
        
        // Get service details with products
        const service: Service = await ServiceService.getServiceById(bookingItem.service_id);
        
        if (!service.service_products || service.service_products.length === 0) {
          console.log(`ℹ️ Service ${service.service_name} has no required products`);
          continue;
        }
        
        // Process each service product
        for (const serviceProduct of service.service_products) {
          if (!serviceProduct.is_required) {
            console.log(`ℹ️ Skipping optional product: ${serviceProduct.product_info.product_name}`);
            continue;
          }
          
          const inventoryItem: BookingInventoryItem = {
            productId: serviceProduct.product_id,
            productName: serviceProduct.product_info.product_name,
            quantity: serviceProduct.quantity,
            unit: serviceProduct.unit,
            isRequired: serviceProduct.is_required,
            serviceId: serviceProduct.service_id,
            serviceName: service.service_name
          };
          
          inventoryItems.push(inventoryItem);
          console.log(`✅ Added required product: ${inventoryItem.productName} (${inventoryItem.quantity} ${inventoryItem.unit})`);
        }
      }
      
      console.log(`📊 Total required products for booking ${booking.booking_id}:`, inventoryItems.length);
      return inventoryItems;
      
    } catch (error) {
      console.error("❌ Error getting booking required products:", error);
      throw error;
    }
  }
  
  /**
   * Reserve inventory for booking (when status becomes PENDING)
   */
  static async reserveInventoryForBooking(
    booking: BookingInfoDto,
    branchId: string
  ): Promise<void> {
    console.log(`🔒 Reserving inventory for booking: ${booking.booking_id}`);
    
    try {
      const requiredProducts = await this.getBookingRequiredProducts(booking);
      
      if (requiredProducts.length === 0) {
        console.log("ℹ️ No products to reserve for this booking");
        return;
      }
      
      // Prepare products for reservation
      const productsToReserve = requiredProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log("🔒 Products to reserve:", productsToReserve);
      
      // Reserve inventory using existing API
      await InventoryService.reserveMultipleForBooking(
        branchId,
        productsToReserve,
        booking.booking_id
      );
      
      console.log(`✅ Successfully reserved inventory for booking: ${booking.booking_id}`);
      
    } catch (error) {
      console.error(`❌ Error reserving inventory for booking ${booking.booking_id}:`, error);
      throw error;
    }
  }
  
  /**
   * Fulfill inventory for booking (when status becomes CONFIRMED)
   */
  static async fulfillInventoryForBooking(
    booking: BookingInfoDto,
    branchId: string
  ): Promise<void> {
    console.log(`📦 Fulfilling inventory for booking: ${booking.booking_id}`);
    
    try {
      const requiredProducts = await this.getBookingRequiredProducts(booking);
      
      if (requiredProducts.length === 0) {
        console.log("ℹ️ No products to fulfill for this booking");
        return;
      }
      
      // Prepare products for fulfillment
      const productsToFulfill = requiredProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log("📦 Products to fulfill:", productsToFulfill);
      
      // Fulfill inventory using existing API
      await InventoryService.fulfillMultipleForBooking(
        branchId,
        productsToFulfill,
        booking.booking_id
      );
      
      console.log(`✅ Successfully fulfilled inventory for booking: ${booking.booking_id}`);
      
    } catch (error) {
      console.error(`❌ Error fulfilling inventory for booking ${booking.booking_id}:`, error);
      throw error;
    }
  }
  
  /**
   * Release inventory for booking (when status becomes CANCELLED)
   */
  static async releaseInventoryForBooking(
    booking: BookingInfoDto,
    branchId: string
  ): Promise<void> {
    console.log(`🔓 Releasing inventory for booking: ${booking.booking_id}`);
    console.log(`🔓 Booking details:`, {
      bookingId: booking.booking_id,
      bookingCode: booking.booking_code,
      status: booking.status,
      branchId: branchId,
      bookingItems: booking.booking_items?.length || 0
    });
    
    try {
      console.log("🔍 Getting required products for booking...");
      const requiredProducts = await this.getBookingRequiredProducts(booking);
      console.log("🔍 Required products found:", requiredProducts);
      
      if (requiredProducts.length === 0) {
        console.log("ℹ️ No products to release for this booking - services may not have required products");
        return;
      }
      
      // Prepare products for release
      const productsToRelease = requiredProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log("🔓 Products to release:", productsToRelease);
      console.log("🔓 Branch ID for release:", branchId);
      console.log("🔓 Booking ID for release:", booking.booking_id);
      
      // Release inventory using existing API
      console.log("🚀 Calling InventoryService.releaseMultipleForBooking...");
      await InventoryService.releaseMultipleForBooking(
        branchId,
        productsToRelease,
        booking.booking_id
      );
      
      console.log(`✅ Successfully released inventory for booking: ${booking.booking_id}`);
      
    } catch (error) {
      console.error(`❌ Error releasing inventory for booking ${booking.booking_id}:`, error);
      console.error(`❌ Error details:`, {
        error: error,
        errorMessage: error?.message,
        errorResponse: error?.response?.data,
        bookingId: booking.booking_id,
        branchId: branchId
      });
      throw error;
    }
  }
}
