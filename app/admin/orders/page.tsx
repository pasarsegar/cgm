"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink, 
  Eye, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  User,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  PauseCircle,
  RefreshCw,
  Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  date: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  total: number;
  currency: string;
  created_at: string;
}

const statusIcons: Record<string, any> = {
  'completed': CheckCircle2,
  'processing': Clock,
  'on-hold': PauseCircle,
  'cancelled': XCircle,
  'refunded': RefreshCw,
  'failed': Ban,
  'pending': AlertCircle,
};

const statusColors: Record<string, string> = {
  'completed': 'bg-[#c6e1c6] text-[#1e4620]',
  'processing': 'bg-[#c8d7e1] text-[#2e4453]',
  'on-hold': 'bg-[#f8dda7] text-[#94660c]',
  'cancelled': 'bg-[#e5e5e5] text-[#777777]',
  'refunded': 'bg-[#e5e5e5] text-[#777777]',
  'failed': 'bg-[#eba3a3] text-[#761919]',
  'pending': 'bg-[#f8dda7] text-[#94660c]',
};

export default function AdminOrders() {
  const searchParams = useSearchParams();
  const action = searchParams.get("action");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer_email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (action === "new") {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium border-b pb-4 mb-4">Add New Order</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        Manual order creation is not yet fully implemented. This is a placeholder form.
                    </p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50 pointer-events-none">
          {/* ... existing form fields ... */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input type="text" className="w-full border border-[#ccd0d4] px-3 py-2 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" placeholder="e.g. John Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Customer Email</label>
              <input type="email" className="w-full border border-[#ccd0d4] px-3 py-2 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" placeholder="e.g. john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shipping Address</label>
              <textarea className="w-full border border-[#ccd0d4] px-3 py-2 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none h-32" placeholder="Full address details..."></textarea>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border border-[#ccd0d4] px-3 py-2 focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none">
                <option value="pending">Pending Payment</option>
                <option value="processing">Processing</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Order Items</label>
              <div className="border border-[#ccd0d4] p-4 bg-gray-50 text-center text-sm text-gray-500">
                <button className="text-[#2271b1] hover:underline">Add items to order</button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t">
          <Link href="/admin/orders" className="px-4 py-2 text-gray-600 hover:text-gray-900 mr-4">Cancel</Link>
          <button disabled className="px-6 py-2 bg-[#2271b1] text-white font-medium hover:bg-[#135e96] transition-colors rounded shadow-sm opacity-50 cursor-not-allowed">
            Create Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-3 border border-[#ccd0d4]">
        <div className="flex items-center space-x-2">
          <select 
            className="border border-[#ccd0d4] bg-white px-2 py-1 text-sm focus:border-[#2271b1] outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="on-hold">On Hold</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
            className="px-3 py-1 border border-[#ccd0d4] bg-white hover:bg-[#f6f7f7] text-sm font-medium"
          >
            Reset
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="border border-[#ccd0d4] bg-white px-3 py-1 pl-8 text-sm focus:border-[#2271b1] outline-none w-full md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1.5" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-[#ccd0d4] overflow-x-auto bg-white min-h-[400px]">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#ccd0d4]">
              <th className="px-4 py-3 font-semibold text-[#1d2327] w-10">
                <input type="checkbox" className="border-[#ccd0d4]" />
              </th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Order</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Date</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Status</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327]">Total</th>
              <th className="px-4 py-3 font-semibold text-[#1d2327] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex justify-center items-center space-x-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                            <span>Loading orders...</span>
                        </div>
                    </td>
                </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status] || AlertCircle;
                return (
                  <tr key={order.id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] transition-colors group">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="border-[#ccd0d4]" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <Link href={`/admin/orders/${order.id}`} className="text-[#2271b1] font-bold hover:text-[#135e96]">
                          #{order.id.slice(0, 8)}... {order.customer_name || 'Guest'}
                        </Link>
                        <span className="text-xs text-gray-500 mt-1">{order.customer_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium",
                        statusColors[order.status] || 'bg-gray-100 text-gray-600'
                      )}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {(order.status || 'unknown').charAt(0).toUpperCase() + (order.status || 'unknown').slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      {order.currency === 'USD' ? '$' : 'Rp'}{(order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-gray-200 rounded text-gray-600" title="View Order">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-200 rounded text-red-600" title="Delete Order">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500 italic">
                  No orders found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 py-2">
        <div>{filteredOrders.length} items</div>
        {/* Pagination logic can be added here later if needed */}
      </div>
    </div>
  );
}
