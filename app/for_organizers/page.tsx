'use client';

import React, { useState } from 'react';
import { MdCheckCircle, MdPeople, MdVideogameAsset, MdTrendingUp } from 'react-icons/md';

export default function ForOrganizers() {
  const [formData, setFormData] = useState({
    organizerName: '',
    organizationType: '',
    pocName: '',
    organizationEmail: '',
    pocEmail: '',
    location: '',
    contactInfo: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      await response.json();
      setSubmitted(true);
      setFormData({
        organizerName: '',
        organizationType: '',
        pocName: '',
        organizationEmail: '',
        pocEmail: '',
        location: '',
        contactInfo: '',
        message: ''
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error submitting application:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1e] text-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">For Organizers</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join GearForge and host your next e-sports tournament with our comprehensive platform. 
            Reach thousands of players and create unforgettable gaming experiences.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10 hover:border-blue-500/30 transition">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              <MdPeople className="text-3xl text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Reach Players Worldwide</h3>
            <p className="text-gray-400">
              Access our community of thousands of dedicated e-sports players and enthusiasts.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10 hover:border-green-500/30 transition">
            <div className="p-3 bg-green-500/20 rounded-lg w-fit mb-4">
              <MdVideogameAsset className="text-3xl text-green-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Multiple Game Support</h3>
            <p className="text-gray-400">
              Host tournaments for popular titles and expand to new games as your community grows.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10 hover:border-purple-500/30 transition">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <MdTrendingUp className="text-3xl text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Grow Your Community</h3>
            <p className="text-gray-400">
              Build and manage your tournament brand with powerful tools and analytics.
            </p>
          </div>
        </div>

        {/* Why Partner with GearForge */}
        <div className="mb-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 rounded-xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Partner with GearForge?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              'Easy-to-use tournament management dashboard',
              'Integrated payment and prize pool management',
              'Real-time leaderboards and streaming support',
              'Marketing support and promotional tools',
              'Community moderation and player verification',
              'Comprehensive analytics and reporting'
            ].map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <MdCheckCircle className="text-green-400 text-2xl flex-shrink-0 mt-1" />
                <p className="text-gray-300">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-2">Become an Organizer</h2>
            <p className="text-gray-400 mb-8">Fill out the form below and we&apos;ll review your application to get started.</p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-300">✓ Application submitted successfully! We&apos;ll review and contact you soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Organizer Name and Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    required
                    placeholder="Company name, club name, etc."
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Organization Type *
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition text-gray-300"
                  >
                    <option value="">Select type</option>
                    <option value="esports-company">E-Sports Company</option>
                    <option value="gaming-club">Gaming Club</option>
                    <option value="university">University/College</option>
                    <option value="community">Community Organization</option>
                    <option value="independent">Independent Organizer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: POC Name and Organization Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Point of Contact (POC) Name *
                  </label>
                  <input
                    type="text"
                    name="pocName"
                    value={formData.pocName}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Organization Email
                  </label>
                  <input
                    type="email"
                    name="organizationEmail"
                    value={formData.organizationEmail}
                    onChange={handleChange}
                    placeholder="contact@organization.com"
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Row 3: POC Email and Location */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Your Email (POC) *
                  </label>
                  <input
                    type="email"
                    name="pocEmail"
                    value={formData.pocEmail}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="City, Country"
                    className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                />
              </div>

              {/* Message Box */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  About Your Organization & Tournament Plans *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your organization, the tournaments you plan to host, games you're interested in, and your target audience..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500 resize-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-300">✕ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>

              <p className="text-sm text-gray-400 text-center">
                * Required fields. We&apos;ll review your application and get back to you within 3-5 business days.
              </p>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Organizer FAQs</h2>
          <div className="space-y-4">
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">What types of tournaments can I host?</h3>
              <p className="text-gray-400">
                You can host tournaments for any game available on our platform, from FPS and MOBA games to fighting games and more. We support various tournament formats including single-elimination, double-elimination, round-robin, and Swiss systems.
              </p>
            </div>
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">How much does it cost to host a tournament?</h3>
              <p className="text-gray-400">
                We offer flexible pricing models tailored to organizers of all sizes. Contact us after submitting your application to discuss pricing options that work best for your organization.
              </p>
            </div>
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">What support do you provide?</h3>
              <p className="text-gray-400">
                We provide technical support, tournament management tools, player verification, prize pool management, and marketing assistance to ensure your tournament&apos;s success.
              </p>
            </div>
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">How long does the approval process take?</h3>
              <p className="text-gray-400">
                We typically review applications within 3-5 business days. Once approved, you can start setting up your tournaments immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
