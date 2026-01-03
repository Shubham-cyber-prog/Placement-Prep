import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Company } from '../lib/supabase';
import { Plus, Edit2, Trash2, Calendar, Briefcase } from 'lucide-react';

export default function Companies() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    application_status: 'Researching',
    application_deadline: '',
    ctc: '',
    preparation_notes: '',
    interview_date: '',
  });

  useEffect(() => {
    if (user) {
      loadCompanies();
    }
  }, [user]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setCompanies(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      application_deadline: formData.application_deadline || null,
      interview_date: formData.interview_date || null,
    };

    if (editingCompany) {
      await supabase
        .from('companies')
        .update({
          ...submitData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingCompany.id);
    } else {
      await supabase.from('companies').insert({
        ...submitData,
        user_id: user?.id,
      });
    }

    setShowModal(false);
    setEditingCompany(null);
    resetForm();
    loadCompanies();
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      role: company.role,
      application_status: company.application_status,
      application_deadline: company.application_deadline || '',
      ctc: company.ctc,
      preparation_notes: company.preparation_notes,
      interview_date: company.interview_date || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await supabase.from('companies').delete().eq('id', id);
      loadCompanies();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      application_status: 'Researching',
      application_deadline: '',
      ctc: '',
      preparation_notes: '',
      interview_date: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Offer':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Interview':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Applied':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const groupedCompanies = companies.reduce((acc, company) => {
    const status = company.application_status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(company);
    return acc;
  }, {} as Record<string, Company[]>);

  const statusOrder = ['Researching', 'Applied', 'Interview', 'Offer', 'Rejected'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Target Companies</h2>
          <p className="text-gray-600 mt-1">Track your applications and interview preparation</p>
        </div>
        <button
          onClick={() => {
            setEditingCompany(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 glass-button transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {statusOrder.map((status) => {
          const statusCompanies = groupedCompanies[status] || [];
          if (statusCompanies.length === 0) return null;

          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status).replace('text-', 'bg-')}`} />
                <h3 className="font-semibold text-gray-900">
                  {status} ({statusCompanies.length})
                </h3>
              </div>

              <div className="space-y-3">
                {statusCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={`bg-white rounded-xl shadow-sm border-2 p-4 hover:shadow-md transition-shadow ${getStatusColor(company.application_status)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {company.name}
                        </h4>
                        {company.role && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {company.role}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {company.ctc && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500">CTC:</span>
                        <p className="text-sm font-medium text-gray-900">{company.ctc}</p>
                      </div>
                    )}

                    {(company.application_deadline || company.interview_date) && (
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        {company.application_deadline && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>Deadline: {new Date(company.application_deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                        {company.interview_date && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>Interview: {new Date(company.interview_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {company.preparation_notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {company.preparation_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <Building2 className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No companies tracked yet</p>
          <p className="text-sm text-gray-400">Click "Add Company" to start tracking your target companies</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Google, Microsoft"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer Intern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Status
                </label>
                <select
                  value={formData.application_status}
                  onChange={(e) => setFormData({ ...formData, application_status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Researching</option>
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected CTC
                </label>
                <input
                  type="text"
                  value={formData.ctc}
                  onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 12-15 LPA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Notes
                </label>
                <textarea
                  value={formData.preparation_notes}
                  onChange={(e) => setFormData({ ...formData, preparation_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Company culture, interview process, topics to focus on..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCompany(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 glass-button transition-colors"
                >
                  {editingCompany ? 'Update' : 'Add'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
