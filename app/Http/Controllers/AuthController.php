<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\LogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * Controlador de autenticacao (login, registro e logout).
 * Usa sessao web + Inertia, protegido por CSRF.
 */
class AuthController extends Controller
{
    /**
     * Exibe a tela de login.
     */
    public function mostrarLogin()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Processa o login do usuario.
     */
    public function login(Request $request)
    {
        LogService::info('1 - iniciando login do usuario', ['email' => $request->email]);

        $credenciais = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credenciais, $request->boolean('lembrar'))) {
            LogService::aviso('2 - credenciais invalidas', ['email' => $request->email]);
            throw ValidationException::withMessages([
                'email' => 'Credenciais inválidas.',
            ]);
        }

        $request->session()->regenerate();

        LogService::info('3 - login realizado com sucesso', ['user_id' => Auth::id()]);

        return redirect()->intended(route('home'));
    }

    /**
     * Exibe a tela de registro.
     */
    public function mostrarRegistro()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Registra um novo usuario comum.
     */
    public function registrar(Request $request)
    {
        LogService::info('1 - iniciando registro de novo usuario');

        $dados = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $usuario = User::create([
            'name'     => $dados['name'],
            'email'    => $dados['email'],
            'password' => Hash::make($dados['password']),
            'role'     => 'user',
        ]);

        Auth::login($usuario);

        LogService::info('2 - usuario registrado e autenticado', ['user_id' => $usuario->id]);

        return redirect()->route('home');
    }

    /**
     * Encerra a sessao do usuario logado.
     */
    public function logout(Request $request)
    {
        LogService::info('1 - encerrando sessao', ['user_id' => Auth::id()]);

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        LogService::info('2 - sessao encerrada');

        return redirect()->route('home');
    }
}
