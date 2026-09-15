import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  // 'login' | '2fa' | 'forgot-email' | 'forgot-code' | 'forgot-reset' | 'register'
  const [step, setStep] = useState('login');

  // Estados de Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados do Cadastro
  const [fullName, setFullName] = useState('');
  const [collabCode, setCollabCode] = useState('');

  // Estados de Código de Segurança (2FA e Recuperação)
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);

  // Handlers de Código
  const handleCodeChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newCode = [...codeDigits];
    newCode[index] = element.value;
    setCodeDigits(newCode);

    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const resetCodeDigits = () => setCodeDigits(['', '', '', '', '', '']);

  // Envio de Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const passwordInput = e.target.elements.passwordInput;
    passwordInput.setCustomValidity('');

    if (password !== '123456') {
      passwordInput.setCustomValidity('Senha incorreta. Por favor, tente novamente.');
      passwordInput.reportValidity();
      return;
    }

    resetCodeDigits();
    setStep('2fa');
  };

  // Envio de 2FA
  const handle2FASubmit = (e) => {
    e.preventDefault();
    if (codeDigits.join('').length < 6) return alert('Digite o código completo de 6 dígitos.');
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.sD5f8_token_exemplo');
    if (rememberMe) localStorage.setItem('userEmail', email);
    navigate('/dashboard');
  };

  // Fluxo Esqueci Senha - Passo 1
  const handleForgotEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert('Informe o e-mail cadastrado.');
    resetCodeDigits();
    setStep('forgot-code');
  };

  // Fluxo Esqueci Senha - Passo 2
  const handleForgotCodeSubmit = (e) => {
    e.preventDefault();
    if (codeDigits.join('').length < 6) return alert('Digite o código enviado por e-mail.');
    setStep('forgot-reset');
  };

  // Fluxo Esqueci Senha - Passo 3
  const handleResetPasswordSubmit = (e) => {
    e.preventDefault();
    const confirmInput = e.target.elements.confirmPasswordInput;
    confirmInput.setCustomValidity('');

    if (password !== confirmPassword) {
      confirmInput.setCustomValidity('As senhas não coincidem.');
      confirmInput.reportValidity();
      return;
    }

    alert('Senha alterada com sucesso!');
    setStep('login');
  };

  // Envio do Cadastro (Primeiro Acesso)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const confirmInput = e.target.elements.regConfirmPasswordInput;
    confirmInput.setCustomValidity('');

    if (password !== confirmPassword) {
      confirmInput.setCustomValidity('As senhas não coincidem.');
      confirmInput.reportValidity();
      return;
    }

    alert('Solicitação de cadastro realizada com sucesso!');
    setStep('login');
  };

  // Textos dinâmicos do cabeçalho
  const getHeaderTitles = () => {
    switch (step) {
      case 'register':
        return {
          title: 'Primeiro acesso',
          subtitle: 'Preencha seus dados para solicitar o cadastro na plataforma'
        };
      case 'forgot-email':
      case 'forgot-code':
      case 'forgot-reset':
        return {
          title: 'Recuperando minha senha',
          subtitle: 'Siga os passos abaixo para redefinir o seu acesso'
        };
      case '2fa':
        return {
          title: 'Verificação de Segurança',
          subtitle: 'Confirme a tentativa de acesso via verificação em duas etapas'
        };
      case 'login':
      default:
        return {
          title: 'Bem-Vindo de volta',
          subtitle: 'Acesse sua conta para acompanhar sua operação em um só lugar'
        };
    }
  };

  const header = getHeaderTitles();

  const inputStyle = {
    width: '100%',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: '8px 12px',
    fontSize: '11px',
    color: '#1f2937',
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', backgroundColor: '#0F1C2C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      
      <style>{`
        .login-card {
          width: 100%;
          max-width: 960px;
          height: 520px;
          border-radius: 32px;
          padding: 24px 48px 32px 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          /* Gradiente original exato */
          background: linear-gradient(270deg, #031F37 0%, #02192E 12%, #054379 25%, #255471 35%, #D8E0E5 60%, #D8E0E5 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }

        /* Mantém a largura fixa de 320px em qualquer tamanho de tela */
        .form-container {
          width: 100%;
          max-width: 320px;
        }

        /* Ajustes exclusivos para dispositivos móveis */
        @media (max-width: 768px) {
          .login-card {
            background: #D8E0E5 !important;
            padding: 24px 20px;
            border-radius: 20px;
            height: auto;
            min-height: auto;
            align-items: center;
          }
          .form-container {
            max-width: 320px;
          }
        }
      `}</style>

      <div className="login-card">
        <div className="form-container">
          
          {/* Logo */}
          <div style={{ marginBottom: '12px', marginTop: '-8px' }}>
            <img 
              src="/logo-topo.png" 
              alt="Nix Core Logo" 
              style={{ width: '100%', maxWidth: '280px', height: 'auto', display: 'block' }}
            />
          </div>

          {/* Cabeçalho Dinâmico */}
          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em', color: '#5AA4DE', textTransform: 'uppercase', marginBottom: '4px' }}>
              PLATAFORMA INTEGRADA DE GESTÃO OPERACIONAL
            </p>

            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#000000', margin: '0 0 4px 0', lineHeight: '1.2' }}>
              {header.title}
            </h1>

            <p style={{ fontSize: '10px', color: '#555555', margin: '0', lineHeight: '1.3' }}>
              {header.subtitle}
            </p>
          </div>

          {/* FLUXO 1: LOGIN */}
          {step === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
              
              <input
                name="passwordInput"
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  e.target.setCustomValidity('');
                  setPassword(e.target.value);
                }}
                style={inputStyle}
                required
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#374151', paddingTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                    />
                    Mostrar senha
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Manter login
                  </label>
                </div>

                <button 
                  type="button" 
                  onClick={() => setStep('forgot-email')} 
                  style={{ color: '#4385C8', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                >
                  Esqueci minha senha
                </button>
              </div>

              <div style={{ paddingTop: '4px' }}>
                <button
                  type="submit"
                  style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer' }}
                >
                  Entrar na Plataforma
                </button>
              </div>

              <div style={{ fontSize: '10px', color: '#1f2937' }}>
                Ainda não possui conta?{' '}
                <button 
                  type="button" 
                  onClick={() => setStep('register')} 
                  style={{ color: '#4385C8', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '10px' }}
                >
                  Solicitar cadastro
                </button>
              </div>
            </form>
          )}

          {/* FLUXO 2: 2FA */}
          {step === '2fa' && (
            <form onSubmit={handle2FASubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '10px', color: '#374151', margin: 0 }}>Digite o código de 6 dígitos enviado para seu e-mail/SMS:</p>

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                {codeDigits.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleCodeChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    style={{ height: '32px', width: '32px', textAlign: 'center', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: '700', color: '#1f2937', border: 'none' }}
                  />
                ))}
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Confirmar Código
              </button>
              
              <button
                type="button"
                onClick={() => setStep('login')}
                style={{ textAlign: 'left', fontSize: '10px', color: '#4385C8', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Voltar para o Login
              </button>
            </form>
          )}

          {/* FLUXO 3: ESQUECI A SENHA - ETAPA 1 */}
          {step === 'forgot-email' && (
            <form onSubmit={handleForgotEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                placeholder="Informe seu e-mail cadastrado"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />

              <button
                type="submit"
                style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Solicitar Código
              </button>

              <button
                type="button"
                onClick={() => setStep('login')}
                style={{ textAlign: 'left', fontSize: '10px', color: '#4385C8', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Voltar para o Login
              </button>
            </form>
          )}

          {/* FLUXO 3: ESQUECI A SENHA - ETAPA 2 */}
          {step === 'forgot-code' && (
            <form onSubmit={handleForgotCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '10px', color: '#374151', margin: 0 }}>Digite o código enviado para <b>{email}</b>:</p>

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                {codeDigits.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleCodeChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    style={{ height: '32px', width: '32px', textAlign: 'center', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.9)', fontSize: '12px', fontWeight: '700', color: '#1f2937', border: 'none' }}
                  />
                ))}
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Validar Código
              </button>

              <button
                type="button"
                onClick={() => setStep('forgot-email')}
                style={{ textAlign: 'left', fontSize: '10px', color: '#4385C8', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Alterar e-mail
              </button>
            </form>
          )}

          {/* FLUXO 3: ESQUECI A SENHA - ETAPA 3 */}
          {step === 'forgot-reset' && (
            <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="password"
                placeholder="Nova Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                name="confirmPasswordInput"
                type="password"
                placeholder="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => {
                  e.target.setCustomValidity('');
                  setConfirmPassword(e.target.value);
                }}
                style={inputStyle}
                required
              />

              <button
                type="submit"
                style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Redefinir Senha
              </button>
            </form>
          )}

          {/* FLUXO 4: CADASTRO / PRIMEIRO ACESSO */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nome Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                type="email"
                placeholder="Email profissional"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                type="text"
                placeholder="Código do Colaborador"
                value={collabCode}
                onChange={(e) => setCollabCode(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />

              <input
                name="regConfirmPasswordInput"
                type="password"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={(e) => {
                  e.target.setCustomValidity('');
                  setConfirmPassword(e.target.value);
                }}
                style={inputStyle}
                required
              />

              <button
                type="submit"
                style={{ width: '100%', padding: '9px', borderRadius: '9999px', backgroundColor: '#0F1C2C', fontSize: '12px', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '4px' }}
              >
                Cadastrar
              </button>

              <button
                type="button"
                onClick={() => setStep('login')}
                style={{ textAlign: 'left', fontSize: '10px', color: '#4385C8', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ← Voltar para o Login
              </button>
            </form>
          )}

        </div>

        {/* Rodapé */}
        <div style={{ fontSize: '10px', color: '#4b5563', fontWeight: '500', marginTop: '16px' }}>
          ©2026 Nix Core. Ambiente Seguro
        </div>
      </div>
    </div>
  );
};

export default Login;