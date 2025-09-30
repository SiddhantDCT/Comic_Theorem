'use client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { useState } from "react"

export default function GoogleSignIn() {
  const { user, loading, signInWithGoogle, logout } = useAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await logout()
      setTimeout(() => {
        setIsSigningOut(false)
      }, 500)
    } catch (error) {
      console.error('Sign out failed:', error)
      setIsSigningOut(false)
    }
  }

  if (loading) {
    return (
      <div className="google-signin-btn-loading">
        <div className="spinner"></div>
        Loading...
      </div>
    )
  }

  if (user) {
    return (
      <div className="user-profile">
        <div className="user-info">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
          ) : (
            <div className="user-avatar-placeholder">
              <User className="icon" />
            </div>
          )}
          <span className="user-name">{user.displayName}</span>
        </div>
        <button 
          onClick={handleSignOut} 
          disabled={isSigningOut}
          className="sign-out-btn"
        >
          {isSigningOut ? (
            <div className="spinner"></div>
          ) : (
            <LogOut className="icon" />
          )}
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>

        <style jsx>{`
          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .user-info {
            display: flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 8px 12px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 14px;
          }
          
          .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }
          
          .user-avatar-placeholder {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .user-name {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .sign-out-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: transparent;
            color: #ef4444;
            border: 1px solid #fecaca;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .sign-out-btn:hover:not(:disabled) {
            background: #fef2f2;
            border-color: #fca5a5;
            transform: translateY(-1px);
          }
          
          .sign-out-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .icon {
            width: 16px;
            height: 16px;
          }
        `}</style>
      </div>
    )
  }

  return (
    <button onClick={handleGoogleSignIn} className="google-signin-btn">
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
        <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z"/>
        <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z"/>
      </svg>
      Sign in with Google

      <style jsx>{`
        .google-signin-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 240px;
          padding: 12px 20px;
          background-color: #fff;
          color: #3c4043;
          border: 1px solid #dadce0;
          border-radius: 8px;
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 auto;
        }

        .google-signin-btn:hover {
          background-color: #f8f9fa;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .google-signin-btn:active {
          background-color: #f1f3f4;
          transform: translateY(0);
        }

        .google-signin-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background-color: #f8f9fa;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}