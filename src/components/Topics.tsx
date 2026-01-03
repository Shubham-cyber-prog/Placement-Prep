import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Topic } from '../lib/supabase';
import { Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Topics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical',
    total_hours: 10,
    completed_hours: 0,
    status: 'Not Started',
    priority: 'Medium',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadTopics();
    }
  }, [user]);

  const loadTopics = async () => {
    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTopics(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTopic) {
      await supabase
        .from('topics')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTopic.id);
    } else {
      await supabase.from('topics').insert({
        ...formData,
        user_id: user?.id,
      });
    }

    setShowModal(false);
    setEditingTopic(null);
    resetForm();
    loadTopics();
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      category: topic.category,
      total_hours: topic.total_hours,
      completed_hours: topic.completed_hours,
      status: topic.status,
      priority: topic.priority,
      notes: topic.notes,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      await supabase.from('topics').delete().eq('id', id);
      loadTopics();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Technical',
      total_hours: 10,
      completed_hours: 0,
      status: 'Not Started',
      priority: 'Medium',
      notes: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Topics</h2>
          <p className="text-gray-600 mt-1">Track your learning progress across different subjects</p>
        </div>
        <button
          onClick={() => {
            setEditingTopic(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Topic
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => {
          const progress = topic.total_hours > 0
            ? Math.round((topic.completed_hours / topic.total_hours) * 100)
            : 0;

          return (
            <div
              key={topic.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {topic.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(topic.status)} flex items-center gap-1`}>
                      {getStatusIcon(topic.status)}
                      {topic.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(topic.priority)}`}>
                      {topic.priority} Priority
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                      {topic.category}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(topic)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {topic.completed_hours}/{topic.total_hours}h ({progress}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {topic.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">{topic.notes}</p>
              )}
            </div>
          );
        })}

        {topics.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-2">No topics yet</p>
            <p className="text-sm text-gray-400">Click "Add Topic" to start tracking your preparation</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Data Structures & Algorithms"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Technical</option>
                    <option>Aptitude</option>
                    <option>Soft Skills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Hours
                  </label>
                  <input
                    type="number"
                    value={formData.total_hours}
                    onChange={(e) => setFormData({ ...formData, total_hours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Completed Hours
                  </label>
                  <input
                    type="number"
                    value={formData.completed_hours}
                    onChange={(e) => setFormData({ ...formData, completed_hours: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Not Started</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any notes or resources..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTopic(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTopic ? 'Update' : 'Add'} Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
