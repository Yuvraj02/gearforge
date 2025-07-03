'use client'

import React, { useState } from 'react'
import clsx from 'clsx'

const RegisterTournament: React.FC = () => {
  const [form, setForm] = useState({
    captain: '',
    members: ['', '', '', ''],
    contact: '',
    discord: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const { name, value } = e.target

    if (name === 'member' && index !== undefined) {
      const updated = [...form.members]
      updated[index] = value
      setForm({ ...form, members: updated })
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submitting:', form)
    alert('Registration submitted!')
  }

  const floatLabel = (value: string) =>
    clsx(
      'absolute left-3 top-3 text-sm text-zinc-400 pointer-events-none transition-opacity duration-200',
      {
        'opacity-0': value !== '',
        'opacity-100': value === '',
      }
    )

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-8 rounded-lg w-full max-w-md shadow-xl text-white"
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Register Team</h2>

        {/* Captain Name */}
        <div className="relative mb-6">
          <input
            name="captain"
            value={form.captain}
            onChange={handleChange}
            className="w-full px-3 pt-3 pb-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className={floatLabel(form.captain)}>Captain Name</label>
        </div>

        {/* Team Members */}
        {form.members.map((member, i) => (
          <div key={i} className="relative mb-6">
            <input
              name="member"
              value={member}
              onChange={(e) => handleChange(e, i)}
              className="w-full px-3 pt-3 pb-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label className={floatLabel(member)}>Team Member {i + 1}</label>
          </div>
        ))}

        {/* Contact */}
        <div className="relative mb-6">
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full px-3 pt-3 pb-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className={floatLabel(form.contact)}>Contact Number</label>
        </div>

        {/* Discord ID */}
        <div className="relative mb-8">
          <input
            name="discord"
            value={form.discord}
            onChange={handleChange}
            className="w-full px-3 pt-3 pb-2 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className={floatLabel(form.discord)}>Discord ID</label>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded text-white font-semibold"
        >
          Submit Registration
        </button>
      </form>
    </div>
  )
}

export default RegisterTournament
