    <!-- Login Modal -->
    <div class="auth-modal-overlay" id="loginModal">
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="closeAuthModal('loginModal')" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="auth-modal-form">
                <div class="auth-card-header">
                    <h2>Log In</h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                <form id="loginForm" class="auth-form" autocomplete="off">
                    <!-- Username -->
                    <div class="auth-form-group">
                        <div class="auth-input-container">
                            <i class="fas fa-user auth-input-icon"></i>
                            <input type="text" id="username" class="auth-input" placeholder=" " value="demo">
                            <label class="auth-label" for="username">Username</label>
                        </div>
                    </div>

                    <!-- Password -->
                    <div class="auth-form-group">
                        <div class="auth-input-container">
                            <i class="fas fa-lock auth-input-icon"></i>
                            <input type="password" id="password" class="auth-input" placeholder=" " value="demo123">
                            <label class="auth-label" for="password">Password</label>
                            <button type="button" class="auth-toggle-pass" onclick="togglePassword('password', this)">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Options -->
                    <div class="auth-form-footer">
                        <label class="auth-remember">
                            <input type="checkbox" name="remember">
                            <span>Remember me</span>
                        </label>
                        <a href="#" class="auth-forgot" onclick="handleForgot(); return false;">Forgot password?</a>
                    </div>

                    <!-- Submit -->
                    <button type="submit" class="auth-submit-btn">
                        <span>Sign In</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>

                    <div class="auth-switch-text">
                        Don't have an account? <a onclick="closeAuthModal('loginModal'); openAuthModal('registerModal');">Join RioCity Now</a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Register Modal -->
    <div class="auth-modal-overlay" id="registerModal">
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="closeAuthModal('registerModal')" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="auth-modal-form register-mode">
                <div class="auth-card-header">
                    <h2>Create Account</h2>
                    <p>Fill in the details below to join the elite</p>
                </div>

                <form id="registerForm" class="auth-form" autocomplete="off">
                    <div class="register-grid">
                        <div class="auth-form-group">
                            <div class="auth-input-container">
                                <i class="fas fa-user auth-input-icon"></i>
                                <input type="text" name="username" class="auth-input" placeholder=" " required>
                                <label class="auth-label">Username</label>
                            </div>
                        </div>
                        <div class="auth-form-group">
                            <div class="auth-input-container">
                                <i class="fas fa-envelope auth-input-icon"></i>
                                <input type="email" name="email" class="auth-input" placeholder=" " required>
                                <label class="auth-label">Email</label>
                            </div>
                        </div>
                    </div>

                    <div class="auth-form-group">
                        <label class="auth-select-label">Mobile Number</label>
                        <div class="phone-input-group">
                            <select class="auth-input phone-country-select" required>
                                <option value="+60">🇲🇾 +60</option>
                                <option value="+65">🇸🇬 +65</option>
                                <option value="+62">🇮🇩 +62</option>
                            </select>
                            <input type="tel" name="phone" class="auth-input phone-number-input" placeholder="Your number" required>
                        </div>
                    </div>

                    <div class="register-grid">
                        <div class="auth-form-group">
                            <div class="auth-input-container">
                                <i class="fas fa-lock auth-input-icon"></i>
                                <input type="password" id="regPassword" class="auth-input" placeholder=" " required oninput="checkPasswordStrength(this.value)">
                                <label class="auth-label">Password</label>
                                <button type="button" class="auth-toggle-pass" onclick="togglePassword('regPassword', this)">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                            <div class="reg-strength">
                                <div class="strength-bar-bg"><div class="strength-fill" id="strengthFill"></div></div>
                                <span class="strength-text" id="strengthText">Min. 8 characters</span>
                            </div>
                        </div>
                        <div class="auth-form-group">
                            <div class="auth-input-container">
                                <i class="fas fa-shield-alt auth-input-icon"></i>
                                <input type="password" id="confirmPassword" class="auth-input" placeholder=" " required>
                                <label class="auth-label">Confirm</label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="auth-submit-btn">
                        <span>Join Now</span>
                        <i class="fas fa-user-plus"></i>
                    </button>

                    <div class="auth-switch-text">
                        Already a member? <a onclick="closeAuthModal('registerModal'); openAuthModal('loginModal');">Log In Here</a>
                    </div>
                    
                    <div class="auth-divider" style="margin: 20px 0 12px;"></div>
                    <h4 style="text-align: center; color: var(--auth-gold); margin-bottom: 12px; font-size: 14px; font-weight: 600;">Register Through Social Media</h4>
                    <div class="social-register-links" style="justify-content: center; margin-bottom: 0;">
                        <a href="#" class="social-register-btn whatsapp"><i class="fab fa-whatsapp"></i></a>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Forgot Password Modal -->
    <div class="forgot-modal-overlay" id="forgotModal">
        <div class="forgot-modal-content">
            <div class="forgot-modal-icon">
                <i class="fas fa-exclamation"></i>
            </div>
            <p class="forgot-modal-text">
                To reset your password, please contact our Customer Support. Would you like to proceed?
            </p>
            <div class="forgot-modal-buttons">
                <button class="forgot-btn forgot-btn-continue" onclick="continueForgot()">Continue</button>
                <button class="forgot-btn forgot-btn-cancel" onclick="closeForgotModal()">Cancel</button>
            </div>
        </div>
    </div>
