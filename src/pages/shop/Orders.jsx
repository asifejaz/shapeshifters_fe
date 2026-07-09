import { useState, useEffect } from 'react';
import api from '../../api';
import { ShoppingCart, CheckCircle, XCircle, Clock, Truck, Eye } from 'lucide-react';
import { formatDisplayDate } from '../../utils/dateFormat';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    api.get('/orders').then((res) => { setOrders(res.data); setLoading(false); });
  };

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}`, { status });
    fetchOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }
  };

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    confirmed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
    processing: { icon: Truck, color: 'bg-purple-100 text-purple-700', label: 'Processing' },
    delivered: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Delivered' },
    cancelled: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Cancelled' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-orange-500" /> Orders
        </h2>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Order #{selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedOrder.delivery_address}, {selectedOrder.city}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold">Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">
                            <div>{item.product_name}</div>
                            {item.selected_attributes && Object.keys(item.selected_attributes).length > 0 && (
                              <div className="text-xs text-gray-500">
                                {Object.entries(item.selected_attributes).map(([name, value]) => `${name}: ${value}`).join(' | ')}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-right">Rs. {item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="font-medium">Rs. {selectedOrder.subtotal}</p>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Discount</p>
                    <p className="font-medium text-green-600">-Rs. {selectedOrder.discount_amount}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Delivery</p>
                  <p className="font-medium">Rs. {selectedOrder.delivery_fee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-lg">Rs. {selectedOrder.total}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Update Status</p>
                <div className="flex gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg ${config.color} hover:opacity-80`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
              {selectedOrder.whatsapp_url && (
                <a
                  href={selectedOrder.whatsapp_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-center font-medium"
                >
                  Send WhatsApp Message
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => {
                const statusInfo = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Rs. {order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDisplayDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
