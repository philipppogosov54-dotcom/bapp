'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, Zap, Lightbulb, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react';
import { ShelfAnalysis } from '@/lib/api/hooks';
import { AIDisclaimer } from './disclaimer';

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  accentGreenLight: '#E8F5EC',
  accentOrange: '#C4804D',
  accentOrangeLight: '#FEF3C7',
  accentBlue: '#3B82F6',
  accentBlueLight: '#EFF6FF',
  scorePoor: '#DC2626',
  scorePoorLight: '#FEE2E2',
};

function getScoreColor(score: number): string {
  if (score >= 85) return colors.accentGreen;
  if (score >= 70) return '#5B9A6F';
  if (score >= 50) return colors.accentOrange;
  return colors.scorePoor;
}

function getScoreLabel(score: number): string {
  if (score >= 85) return 'Отличная совместимость! 🎉';
  if (score >= 70) return 'Хорошая полка 👍';
  if (score >= 50) return 'Есть рекомендации ⚠️';
  return 'Требуется внимание ❗';
}

interface ShelfAnalysisCardProps {
  analysis: ShelfAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: () => void;
  productCount: number;
}

// PRD Gap: Shelf Analysis UI
export const ShelfAnalysisCard: React.FC<ShelfAnalysisCardProps> = ({
  analysis,
  isLoading,
  error,
  onAnalyze,
  productCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show if no products
  if (productCount === 0) {
    return null;
  }

  // Need at least 2 products for meaningful analysis
  if (productCount < 2) {
    return (
      <div style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: colors.bgSecondary,
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <Sparkles size={24} style={{ color: colors.textTertiary, marginBottom: '8px' }} />
        <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
          Добавьте больше продуктов для AI-анализа полки
        </p>
      </div>
    );
  }

  // Show analyze button if no analysis yet
  if (!analysis && !isLoading && !error) {
    return (
      <div style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: colors.accentBlueLight,
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <Sparkles size={28} style={{ color: colors.accentBlue, marginBottom: '12px' }} />
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: '8px',
        }}>
          AI-анализ вашей полки
        </h3>
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.875rem',
          marginBottom: '16px',
        }}>
          Проверим совместимость продуктов и дадим персональные рекомендации
        </p>
        <button
          onClick={onAnalyze}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.accentBlue,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
          }}
        >
          <Sparkles size={18} />
          Анализировать
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        padding: '32px 20px',
        borderRadius: '16px',
        backgroundColor: colors.bgSecondary,
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <Loader2 size={32} style={{ color: colors.accentBlue, marginBottom: '12px', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.9375rem' }}>
          Анализируем вашу полку...
        </p>
        <p style={{ color: colors.textTertiary, margin: '8px 0 0', fontSize: '0.8125rem' }}>
          Это может занять несколько секунд
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: colors.scorePoorLight,
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <AlertTriangle size={24} style={{ color: colors.scorePoor, marginBottom: '8px' }} />
        <p style={{ color: colors.scorePoor, margin: 0, marginBottom: '12px', fontSize: '0.875rem' }}>
          {error}
        </p>
        <button
          onClick={onAnalyze}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '10px',
            backgroundColor: colors.scorePoor,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          <RefreshCw size={16} />
          Повторить
        </button>
      </div>
    );
  }

  // Analysis results
  if (!analysis) return null;

  const hasConflicts = analysis.conflicts && analysis.conflicts.length > 0;
  const hasSynergies = analysis.synergies && analysis.synergies.length > 0;
  const hasSuggestions = analysis.suggestions && analysis.suggestions.length > 0;
  const hasDetails = hasConflicts || hasSynergies || hasSuggestions;

  return (
    <div style={{
      borderRadius: '16px',
      backgroundColor: colors.bgSecondary,
      marginBottom: '24px',
      overflow: 'hidden',
    }}>
      {/* Score Header */}
      <div style={{
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* Score Circle */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(${getScoreColor(analysis.overallScore)} ${analysis.overallScore}%, ${colors.bgTertiary} 0)`,
          flexShrink: 0,
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.bgSecondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{analysis.overallScore}</span>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} style={{ color: colors.accentBlue }} />
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: colors.accentBlue,
              textTransform: 'uppercase',
            }}>
              AI-анализ
            </span>
          </div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            {getScoreLabel(analysis.overallScore)}
          </h3>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: colors.bgTertiary,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={16} style={{ color: colors.textSecondary }} />
        </button>
      </div>

      {/* Recommendation */}
      {analysis.recommendation && (
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${colors.bgTertiary}`,
        }}>
          <p style={{
            color: colors.textSecondary,
            margin: 0,
            fontSize: '0.9375rem',
            lineHeight: 1.5,
          }}>
            {analysis.recommendation}
          </p>
        </div>
      )}

      {/* Expand Button for Details */}
      {hasDetails && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              backgroundColor: colors.bgTertiary,
              border: 'none',
              cursor: 'pointer',
              color: colors.textSecondary,
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {isExpanded ? (
              <>Скрыть подробности <ChevronUp size={16} /></>
            ) : (
              <>Показать подробности <ChevronDown size={16} /></>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '20px' }}>
                  {/* Conflicts */}
                  {hasConflicts && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.scorePoor,
                        margin: '0 0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <AlertTriangle size={14} />
                        Возможные конфликты
                      </h4>
                      {analysis.conflicts.map((conflict, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          borderRadius: '10px',
                          backgroundColor: colors.scorePoorLight,
                          marginBottom: '8px',
                        }}>
                          <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px', fontSize: '0.875rem' }}>
                            {conflict.products.join(' + ')}
                          </div>
                          <div style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                            {conflict.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Synergies */}
                  {hasSynergies && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.accentGreen,
                        margin: '0 0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <Zap size={14} />
                        Хорошие сочетания
                      </h4>
                      {analysis.synergies.map((synergy, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          borderRadius: '10px',
                          backgroundColor: colors.accentGreenLight,
                          marginBottom: '8px',
                        }}>
                          <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px', fontSize: '0.875rem' }}>
                            {synergy.products.join(' + ')}
                          </div>
                          <div style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                            {synergy.benefit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {hasSuggestions && (
                    <div>
                      <h4 style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: colors.accentOrange,
                        margin: '0 0 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}>
                        <Lightbulb size={14} />
                        Рекомендации
                      </h4>
                      {analysis.suggestions.map((suggestion, i) => (
                        <div key={i} style={{
                          padding: '12px',
                          borderRadius: '10px',
                          backgroundColor: colors.accentOrangeLight,
                          marginBottom: '8px',
                        }}>
                          <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px', fontSize: '0.875rem' }}>
                            {suggestion.type === 'add' && '➕ Добавить: '}
                            {suggestion.type === 'remove' && '➖ Убрать: '}
                            {suggestion.type === 'replace' && '🔄 Заменить: '}
                            {suggestion.product}
                          </div>
                          <div style={{ color: colors.textSecondary, fontSize: '0.8125rem' }}>
                            {suggestion.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AI Disclaimer */}
                  <div style={{ marginTop: '16px' }}>
                    <AIDisclaimer />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default ShelfAnalysisCard;
