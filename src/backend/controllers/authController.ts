import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v7 as uuidv7 } from 'uuid';
import db from '../config/database';
import { authConfig, JwtRefreshPayload, JwtUserPayload } from '../config/auth';
import {
  buscarRefreshTokenAtivo,
  revogarRefreshToken,
  revogarRefreshTokenPorToken,
  salvarRefreshToken,
  tokenEstaExpirado,
} from '../repositories/refreshTokenRepository';

function gerarAccessToken(usuario: JwtUserPayload) {
  return jwt.sign(usuario, authConfig.accessSecret, {
    expiresIn: authConfig.accessTokenExpiresIn,
  });
}

function calcularExpiracaoRefreshToken() {
  return new Date(Date.now() + authConfig.refreshCookieMaxAgeMs);
}

function gerarRefreshToken(usuario: JwtUserPayload, tokenId: string) {
  return jwt.sign({ ...usuario, jti: tokenId }, authConfig.refreshSecret, {
    expiresIn: authConfig.refreshTokenExpiresIn,
  });
}

function definirRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(authConfig.refreshCookieName, refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: authConfig.refreshCookieMaxAgeMs,
  });
}

export function login(req: Request, res: Response) {
  const { usuario, senha, perfil } = req.body;

  if (!usuario || !senha || !perfil) {
    return res.status(400).json({ sucesso: false, erro: 'Campos obrigatórios não preenchidos.' });
  }

  const row = db.prepare('SELECT * FROM usuarios WHERE nome = ? AND perfil = ?').get(usuario, perfil) as any;

  if (!row) {
    return res.status(401).json({ sucesso: false, erro: 'Usuário não encontrado.' });
  }

  const senhaValida = bcrypt.compareSync(senha, row.senha);

  if (!senhaValida) {
    return res.status(401).json({ sucesso: false, erro: 'Senha incorreta.' });
  }

  const usuarioAutenticado: JwtUserPayload = {
    id: row.id,
    nome: row.nome,
    perfil: row.perfil,
    retiro_id: row.retiro_id,
  };

  const refreshTokenId = uuidv7();
  const accessToken = gerarAccessToken(usuarioAutenticado);
  const refreshToken = gerarRefreshToken(usuarioAutenticado, refreshTokenId);

  salvarRefreshToken({
    id: refreshTokenId,
    usuarioId: usuarioAutenticado.id,
    token: refreshToken,
    expiresAt: calcularExpiracaoRefreshToken(),
  });

  definirRefreshCookie(res, refreshToken);

  return res.json({
    sucesso: true,
    perfil: row.perfil,
    usuario: usuarioAutenticado,
    accessToken,
  });
}

export function refresh(req: Request, res: Response) {
  const token = req.cookies?.[authConfig.refreshCookieName];

  if (!token) {
    return res.status(401).json({ sucesso: false, erro: 'Refresh token ausente.' });
  }

  try {
    const payload = jwt.verify(token, authConfig.refreshSecret) as JwtRefreshPayload;

    if (!payload.jti) {
      res.clearCookie(authConfig.refreshCookieName);
      return res.status(401).json({ sucesso: false, erro: 'Refresh token sem identificador.' });
    }

    const tokenSalvo = buscarRefreshTokenAtivo(payload.jti, token);

    if (!tokenSalvo || tokenEstaExpirado(tokenSalvo)) {
      res.clearCookie(authConfig.refreshCookieName);
      return res.status(401).json({ sucesso: false, erro: 'Refresh token revogado ou expirado.' });
    }

    const usuario: JwtUserPayload = {
      id: payload.id,
      nome: payload.nome,
      perfil: payload.perfil,
      retiro_id: payload.retiro_id,
    };

    revogarRefreshToken(payload.jti);

    const refreshTokenId = uuidv7();
    const accessToken = gerarAccessToken(usuario);
    const refreshToken = gerarRefreshToken(usuario, refreshTokenId);

    salvarRefreshToken({
      id: refreshTokenId,
      usuarioId: usuario.id,
      token: refreshToken,
      expiresAt: calcularExpiracaoRefreshToken(),
    });

    definirRefreshCookie(res, refreshToken);

    return res.json({ sucesso: true, accessToken, usuario });
  } catch {
    res.clearCookie(authConfig.refreshCookieName);
    return res.status(401).json({ sucesso: false, erro: 'Refresh token invalido ou expirado.' });
  }
}

export function logout(req: Request, res: Response) {
  const token = req.cookies?.[authConfig.refreshCookieName];

  if (token) {
    revogarRefreshTokenPorToken(token);
  }

  res.clearCookie(authConfig.refreshCookieName);
  return res.json({ sucesso: true });
}
