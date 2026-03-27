'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, Button, Input, Textarea, Select, Modal, Badge } from '@/components/ui';
import { Customer, CustomerStatus } from '@/types';
import { useRouter } from 'next/navigation';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function SalesPage() {
  const { user, isAuthenticated } = useAuth();
  const { customers, addCustomer, updateCustomer, addJob, addNotification, users, jobs } = useData();
  const router = useRouter();
  const hydrated = useHydrated();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    product: '',
    expectedClosingDate: '',
    notes: '',
    status: 'lead' as CustomerStatus,
    followUpDate: '',
  });

  const [dispatchData, setDispatchData] = useState({
    type: 'delivery',
    scheduledDate: '',
    assignedTo: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && !['sales', 'admin'].includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.product.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  const pendingFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return customers.filter(c => {
      if (!c.followUpDate || c.status === 'closed' || c.status === 'confirmed') return false;
      const followUp = new Date(c.followUpDate);
      followUp.setHours(0, 0, 0, 0);
      return followUp <= today;
    });
  }, [customers]);

  const handleAddCustomer = () => {
    if (!user || !formData.name || !formData.phone || !formData.address) return;

    addCustomer({
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      product: formData.product,
      inquiryDate: new Date(),
      expectedClosingDate: formData.expectedClosingDate ? new Date(formData.expectedClosingDate) : null,
      notes: formData.notes,
      status: formData.status,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
      createdBy: user.id,
    });

    setFormData({
      name: '',
      phone: '',
      address: '',
      product: '',
      expectedClosingDate: '',
      notes: '',
      status: 'lead',
      followUpDate: '',
    });
    setShowAddModal(false);
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer || !formData.name || !formData.phone || !formData.address) return;

    updateCustomer(selectedCustomer.id, {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      product: formData.product,
      expectedClosingDate: formData.expectedClosingDate ? new Date(formData.expectedClosingDate) : null,
      notes: formData.notes,
      status: formData.status,
      followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : null,
    });

    setShowEditModal(false);
    setSelectedCustomer(null);
  };

  const handleConvertToOrder = (customer: Customer) => {
    updateCustomer(customer.id, { status: 'confirmed' });
  };

  const handleCreateDispatch = () => {
    if (!selectedCustomer || !dispatchData.scheduledDate) return;

    const serviceHead = users.find(u => u.role === 'service_head');

    addJob({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      address: selectedCustomer.address,
      product: selectedCustomer.product,
      type: dispatchData.type as 'delivery' | 'installation' | 'service',
      status: 'pending',
      source: 'dispatch',
      scheduledDate: new Date(dispatchData.scheduledDate),
      assignedTo: dispatchData.assignedTo || null,
      rescheduleReason: null,
      images: [],
      remarks: '',
      completedAt: null,
      createdBy: user?.id || '',
    });

    if (serviceHead) {
      addNotification({
        userId: serviceHead.id,
        type: 'alert',
        title: 'New Dispatch Request',
        message: `New ${dispatchData.type} request from Sales for ${selectedCustomer.name}`,
        read: false,
      });
    }

    setShowDispatchModal(false);
    setSelectedCustomer(null);
    setDispatchData({ type: 'delivery', scheduledDate: '', assignedTo: '' });
  };

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      product: customer.product,
      expectedClosingDate: customer.expectedClosingDate ? new Date(customer.expectedClosingDate).toISOString().split('T')[0] : '',
      notes: customer.notes,
      status: customer.status,
      followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const openDispatchModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDispatchData({
      type: 'delivery',
      scheduledDate: '',
      assignedTo: '',
    });
    setShowDispatchModal(true);
  };

  const getStatusBadge = (status: CustomerStatus) => {
    const variants: Record<CustomerStatus, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
      lead: 'info',
      prospect: 'warning',
      confirmed: 'success',
      closed: 'default',
    };
    return variants[status];
  };

  const getJobsForCustomer = (customerId: string) => {
    return jobs.filter(j => j.customerId === customerId);
  };

  if (!hydrated || !user || !['sales', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Management</h1>
            <p className="text-[#A0A0B8] mt-1">Manage leads, prospects, and orders</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </Button>
        </div>

        {pendingFollowUps.length > 0 && (
          <Card className="border-[#FFB830]/30 bg-[#FFB830]/5">
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#FFB830] animate-pulse" />
                <span className="text-[#FFB830] font-medium">{pendingFollowUps.length} follow-up(s) due today</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'lead', label: 'Lead' },
              { value: 'prospect', label: 'Prospect' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'closed', label: 'Closed' },
            ]}
            className="w-40"
          />
        </div>

        <div className="bg-[#1E1E32] border border-[#3A3A5C] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#3A3A5C]">
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Customer</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Product</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Status</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Follow-up</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Jobs</th>
                <th className="text-left p-4 text-sm font-medium text-[#A0A0B8]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, idx) => (
                <tr 
                  key={customer.id} 
                  className="border-b border-[#3A3A5C]/50 table-row-hover"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <td className="p-4">
                    <div>
                      <p className="text-white font-medium">{customer.name}</p>
                      <p className="text-sm text-[#A0A0B8]">{customer.phone}</p>
                      <p className="text-xs text-[#6B6B80] mt-1">{customer.address}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-white">{customer.product}</p>
                    {customer.expectedClosingDate && (
                      <p className="text-xs text-[#A0A0B8]">Expected: {new Date(customer.expectedClosingDate).toLocaleDateString()}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={getStatusBadge(customer.status)}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {customer.followUpDate ? (
                      <span className={new Date(customer.followUpDate) <= new Date() ? 'text-[#FFB830]' : 'text-[#A0A0B8]'}>
                        {new Date(customer.followUpDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[#6B6B80]">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-white font-mono">{getJobsForCustomer(customer.id).length}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(customer)}>
                        Edit
                      </Button>
                      {customer.status !== 'confirmed' && customer.status !== 'closed' && (
                        <Button variant="secondary" size="sm" onClick={() => handleConvertToOrder(customer)}>
                          Convert
                        </Button>
                      )}
                      {customer.status === 'confirmed' && (
                        <Button variant="primary" size="sm" onClick={() => openDispatchModal(customer)}>
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-[#A0A0B8]">
              No customers found
            </div>
          )}
        </div>

        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Customer" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
              <Input
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>
            <Input
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
            <Input
              label="Product Interested/Purchased"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Modern Sofa Set"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expected Closing Date"
                type="date"
                value={formData.expectedClosingDate}
                onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
              />
              <Input
                label="Follow-up Date"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'prospect', label: 'Prospect' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddCustomer} className="flex-1">
                Add Customer
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Customer" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <Input
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label="Product Interested/Purchased"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expected Closing Date"
                type="date"
                value={formData.expectedClosingDate}
                onChange={(e) => setFormData({ ...formData, expectedClosingDate: e.target.value })}
              />
              <Input
                label="Follow-up Date"
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              options={[
                { value: 'lead', label: 'Lead' },
                { value: 'prospect', label: 'Prospect' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleEditCustomer} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showDispatchModal} onClose={() => setShowDispatchModal(false)} title="Create Dispatch Request">
          <div className="space-y-4">
            <div className="p-4 bg-[#0F0F1A] rounded-lg">
              <p className="text-white font-medium">{selectedCustomer?.name}</p>
              <p className="text-sm text-[#A0A0B8]">{selectedCustomer?.product}</p>
              <p className="text-sm text-[#A0A0B8]">{selectedCustomer?.address}</p>
            </div>
            <Select
              label="Job Type"
              value={dispatchData.type}
              onChange={(e) => setDispatchData({ ...dispatchData, type: e.target.value })}
              options={[
                { value: 'delivery', label: 'Delivery' },
                { value: 'installation', label: 'Installation' },
                { value: 'service', label: 'Service' },
              ]}
            />
            <Input
              label="Scheduled Date"
              type="date"
              value={dispatchData.scheduledDate}
              onChange={(e) => setDispatchData({ ...dispatchData, scheduledDate: e.target.value })}
            />
            <Select
              label="Assign To (Optional)"
              value={dispatchData.assignedTo}
              onChange={(e) => setDispatchData({ ...dispatchData, assignedTo: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...users.filter(u => u.role === 'field_staff').map(u => ({ value: u.id, label: u.name })),
              ]}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowDispatchModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateDispatch} className="flex-1">
                Create Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
