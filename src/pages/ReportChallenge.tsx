import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, AlertTriangle, MapPin, X } from 'lucide-react';

export default function ReportChallenge() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'civic',
    title: '',
    description: '',
    category: '',
    district: '',
    severity: 'medium',
    location: ''
  });

  const categories = {
    civic: [
      'Roads & Infrastructure',
      'Water Supply',
      'Waste Management',
      'Street Lights',
      'Public Transport',
      'Parks & Gardens',
      'Drainage',
      'Other'
    ],
    emergency: [
      'Accident',
      'Fire',
      'Medical Emergency',
      'Natural Disaster',
      'Crime',
      'Building Collapse',
      'Other'
    ]
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const runAIAnalysis = (data: typeof formData) => {
    const text = `${data.title} ${data.description}`.toLowerCase();

    const emergencyKeywords = [
      'accident',
      'fire',
      'emergency',
      'urgent',
      'danger',
      'injured',
      'collapse',
      'bleeding'
    ];

    const isEmergency =
      emergencyKeywords.some((keyword) => text.includes(keyword)) ||
      data.type === 'emergency';

    const categoryRules: Record<string, string[]> = {
      'Roads & Infrastructure': [
        'road',
        'pothole',
        'pit',
        'bridge',
        'street',
        'pavement',
        'highway',
        'landslide',
        'land slide'
      ],
      'Water Supply': [
        'water',
        'leak',
        'pipeline',
        'tap',
        'supply',
        'drinking',
        'contaminated'
      ],
      'Waste Management': [
        'garbage',
        'waste',
        'trash',
        'dump',
        'sanitation',
        'rubbish'
      ],
      'Street Lights': [
        'light',
        'dark',
        'electricity',
        'power',
        'pole'
      ],
      'Drainage': [
        'drain',
        'sewage',
        'waterlogging',
        'flood',
        'gutter'
      ],
      'Public Transport': [
        'bus',
        'transport',
        'auto',
        'taxi',
        'stand'
      ],
      'Parks & Gardens': [
        'park',
        'garden',
        'playground',
        'green',
        'trees'
      ]
    };

    let detectedCategory = data.category || 'Other';

    if (!data.category) {
      for (const [category, keywords] of Object.entries(categoryRules)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
          detectedCategory = category;
          break;
        }
      }
    }

    let priority = 'medium';
    let confidence = 75;
    let reason = '';

    if (isEmergency) {
      priority = 'critical';
      confidence = 92;
      reason =
        'Emergency keywords detected or the report was submitted as an emergency. Immediate attention required.';
    } else if (
      text.includes('major') ||
      text.includes('severe') ||
      data.severity === 'high'
    ) {
      priority = 'high';
      confidence = 85;
      reason = 'High severity indicators detected.';
    } else {
      priority = 'medium';
      confidence = 75;
      reason =
        'Standard civic issue requiring scheduled attention.';
    }

    const departmentMap: Record<string, string> = {
      'Roads & Infrastructure': 'Public Works Department (PWD)',
      'Water Supply': 'Water & Sanitation Department',
      'Waste Management':
        'Municipal Corporation / Urban Development',
      'Street Lights': 'Electricity Department (JSEB)',
      'Drainage': 'Water & Sanitation Department',
      'Public Transport': 'Transport Department',
      'Parks & Gardens': 'Forest & Environment Department'
    };

    return {
      ai_category: detectedCategory,
      ai_priority: priority,
      ai_confidence: confidence,
      ai_reason: reason,
      suggested_department:
        departmentMap[detectedCategory] || 'General Administration',
      is_emergency: isEmergency
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert('Please login to report a challenge');
        window.location.href = '/login';
        return;
      }

      // Run AI triage
      const aiAnalysis = runAIAnalysis(formData);

      let imageUrl: string | null = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('challenge-media')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl }
        } = supabase.storage
          .from('challenge-media')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      /*
       * Workflow:
       *
       * Emergency → Government review
       * Normal civic issue → AI reviewed / university lane
       */
      const initialStatus = aiAnalysis.is_emergency
        ? 'submitted'
        : 'ai_reviewed';

      /*
       * IMPORTANT:
       * Save the AI emergency + priority information to the
       * actual challenge columns.
       */
      const { error } = await supabase
        .from('challenges')
        .insert({
          citizen_id: user.id,
          title: formData.title,
          description: formData.description,

          // Final category selected/detected by AI
          category:
            formData.category || aiAnalysis.ai_category,

          // Location
          district: formData.district,

          // Citizen-provided severity
          severity: formData.severity,

          // AI triage fields
          is_emergency: aiAnalysis.is_emergency,

          emergency_type: aiAnalysis.is_emergency
            ? formData.category || 'Other'
            : null,

          priority: aiAnalysis.ai_priority,

          triage_status: 'pending_review',

          // Workflow status
          status: initialStatus,

          // Uploaded evidence
          image_url: imageUrl,

          // AI analysis details
          ai_category: aiAnalysis.ai_category,
          ai_priority: aiAnalysis.ai_priority,
          ai_confidence: aiAnalysis.ai_confidence,
          ai_reason: aiAnalysis.ai_reason
        });

      if (error) {
        throw error;
      }

      if (aiAnalysis.is_emergency) {
        alert(
          '🚨 Emergency reported! Government has been notified for immediate review.'
        );
      } else {
        alert(
          '✅ Challenge reported successfully! AI has categorized and routed your report.'
        );
      }

      window.location.href = '/dashboard/citizen';
    } catch (error: any) {
      console.error('Challenge submission error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() =>
            (window.location.href = '/dashboard/citizen')
          }
          className="mb-4 text-blue-600 hover:underline flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-3xl font-bold mb-2 text-gray-800">
            Report a Challenge
          </h2>

          <p className="text-gray-600 mb-6">
            Help us improve Jharkhand by reporting issues in your area
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Report Type *
              </label>

              <div className="grid grid-cols-2 gap-4">

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: 'civic',
                      category: ''
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.type === 'civic'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">
                    Civic Issue
                  </div>

                  <div className="text-sm opacity-75">
                    Roads, Water, Waste, etc.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      type: 'emergency',
                      category: ''
                    })
                  }
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.type === 'emergency'
                      ? 'border-red-600 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-center gap-2">
                    <AlertTriangle size={18} />
                    Emergency
                  </div>

                  <div className="text-sm opacity-75">
                    Accident, Fire, Medical
                  </div>
                </button>

              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title *
              </label>

              <input
                type="text"
                required
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>

              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">
                  Select Category
                </option>

                {categories[
                  formData.type as keyof typeof categories
                ].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* District + Severity */}
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District *
                </label>

                <input
                  type="text"
                  required
                  placeholder="Your district"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      district: e.target.value
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Severity
                </label>

                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      severity: e.target.value
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

            </div>

            {/* Specific Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Specific Location
              </label>

              <input
                type="text"
                placeholder="Street name, landmark, or area"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Description *
              </label>

              <textarea
                required
                rows={4}
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value
                  })
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Photo/Video
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="file-upload"
                />

                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />

                  <span className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </span>
                </label>

                {imagePreview && (
                  <div className="mt-4 relative">

                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>

                  </div>
                )}

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                formData.type === 'emergency'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {loading
                ? 'Submitting...'
                : formData.type === 'emergency'
                ? '🚨 Report Emergency'
                : 'Submit Challenge'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}