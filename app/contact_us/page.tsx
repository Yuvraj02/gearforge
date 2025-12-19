'use client';

import React, { useState } from 'react';
import { MdMailOutline, MdLocationOn } from 'react-icons/md';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      await response.json();
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1a1a1e] text-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-400">
            Have questions or feedback? We&apos;d love to hear from you. Reach out to us anytime.
          </p>
        </div>

        {/* Contact Information Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
          {/* Email Card */}
          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <MdMailOutline className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Email</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">Send us an email</p>
            <a
              href="mailto:gearforge.india@gmail.com"
              className="text-blue-400 hover:text-blue-300 font-medium break-all"
            >
              gearforge.india@gmail.com
            </a>
          </div>

          {/* Location Card */}
          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10 hover:border-white/20 transition">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <MdLocationOn className="text-2xl text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold">Location</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">Visit us</p>
            <p className="text-gray-300 font-medium">India</p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-[#2a2a2f] to-[#1f1f24] rounded-xl p-8 border border-white/10">
            <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
            <p className="text-gray-400 mb-8">We&apos;ll get back to you as soon as possible.</p>

            {submitted && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-300">✓ Thank you for your message! We&apos;ll be in touch soon.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="What is this about?"
                  className="w-full px-4 py-3 bg-[#1a1a1e] border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none transition placeholder-gray-500"
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
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
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">What is GearForge?</h3>
              <p className="text-gray-400">
                GearForge is a premier e-sports tournament platform designed to connect gamers and organizers worldwide.
              </p>
            </div>
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">How long does it take to hear back?</h3>
              <p className="text-gray-400">
                We typically respond to inquiries within 24–48 hours during business days.
              </p>
            </div>
            <div className="bg-[#2a2a2f] rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-2">Can I become a tournament organizer?</h3>
              <p className="text-gray-400">
                Yes! Visit our &quot;For Organizers&quot; page to learn more about hosting tournaments on GearForge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
