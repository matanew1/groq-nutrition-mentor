
import React from 'react';
import { Apple, Heart, Zap, LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { EnhancedBadge } from '@/components/ui/EnhancedBadge';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import LanguageToggle from '@/components/LanguageToggle';
import SettingsDialog from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  onClearMessages: () => void;
  activeTab: string;
}

export const AppHeader = ({ onClearMessages, activeTab }: AppHeaderProps) => {
  const { user, signOut } = useAuth();
  const { t, language, userName } = useSettings();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isRTL = language === 'he';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('success'),
        description: "You have been signed out successfully.",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="glass-card-enhanced" style={{
      backdropFilter: 'blur(20px)',
      borderWidth: 0,
      position: 'sticky',
      top: 0,
      zIndex: 50,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexDirection: isRTL ? 'row-reverse' : 'row'
        }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #9333ea)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <Apple style={{ height: '24px', width: '24px', color: 'white' }} />
          </div>
          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <h1 className="heading-enhanced" style={{
              fontSize: '32px',
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {t('nutrimentor')}
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              display: 'block'
            }}>
              {t('subtitle')}
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexDirection: isRTL ? 'row-reverse' : 'row'
          }}>
            <EnhancedBadge variant="success">
              <Heart style={{ height: '12px', width: '12px' }} />
              <span>Health</span>
            </EnhancedBadge>
            <EnhancedBadge variant="default">
              <Zap style={{ height: '12px', width: '12px' }} />
              <span>AI</span>
            </EnhancedBadge>
            
            <LanguageToggle />
            <SettingsDialog />
            
            {user ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexDirection: isRTL ? 'row-reverse' : 'row'
              }}>
                {userName && (
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'inline'
                  }}>
                    {t('welcome')}, {userName}
                  </span>
                )}
                {activeTab === 'chat' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearMessages}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      background: 'transparent'
                    }}
                  >
                    <Trash2 style={{ height: '16px', width: '16px' }} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: 'transparent'
                  }}
                >
                  <LogOut style={{ height: '16px', width: '16px' }} />
                </Button>
              </div>
            ) : (
              <EnhancedButton
                size="sm"
                onClick={() => navigate('/auth')}
              >
                {t('signIn')}
              </EnhancedButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
