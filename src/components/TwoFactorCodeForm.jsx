import { useState } from 'react'

export default function TwoFactorCodeForm({ onSubmit, loading, error }) {
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(code)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className="text-[18px] font-semibold text-black mb-1">Two-Factor Verification</h2>
      <p className="text-[13px] text-[#4b4b4b] mb-4">
        Enter the 6-digit code from your authenticator app, or one of your recovery codes.
      </p>

      {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

      <div className="mb-4">
        <input
          type="text"
          inputMode="numeric"
          autoFocus
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          className="w-full h-[47px] rounded-[30px] border border-[#a9a9a9] bg-white text-center text-[18px] tracking-[6px] outline-none px-5 focus:border-cz-primary"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center rounded-full bg-cz-primary hover:bg-cz-primary-hover text-white text-[14px] font-semibold py-[10px] px-[30px] transition-colors disabled:opacity-60"
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </form>
  )
}
