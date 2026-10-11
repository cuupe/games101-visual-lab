import React from 'react';
import {Formula} from './Formula';
// Explicit tokens from the authored prose; ordinary English is never guessed as TeX.
const r=String.raw;
export const inlineTokens={
 'xscreen=(xndc+1)W/2':r`x_{\mathrm{screen}}=(x_{\mathrm{ndc}}+1)W/2`,
 '1/f=1/u+1/v':r`\frac1f=\frac1u+\frac1v`,
 'n₁sinθi=n₂sinθt':r`n_1\sin\theta_i=n_2\sin\theta_t`,
 'F=F₀+(1−F₀)(1−cosθ)⁵':r`F=F_0+(1-F_0)(1-\cos\theta)^5`,
 'P=αA+βB+γC':r`P=\alpha A+\beta B+\gamma C`,
 'yn+1=yn+h f(yn,tn)':r`y_{n+1}=y_n+h f(y_n,t_n)`,
 'yn+1=yn+h f(yn+1,tn+1)':r`y_{n+1}=y_n+h f(y_{n+1},t_{n+1})`,
 'xn+1≈2xn−xn−1+an h²':r`x_{n+1}\approx2x_n-x_{n-1}+a_nh^2`,
 'Cn=Cn−1+(Xn−Cn−1)/n':r`C_n=C_{n-1}+(X_n-C_{n-1})/n`,
 'x²+y²+z²−r²=0':r`x^2+y^2+z^2-r^2=0`,
 'σt=σa+σs':r`\sigma_t=\sigma_a+\sigma_s`,
 'dω=cosθ′ dA/r²':r`d\omega=\cos\theta'\,dA/r^2`,
 'dω=cosθlight dA/r²':r`d\omega=\cos\theta_L\,dA/r^2`,
 'sinθ dθ dφ':r`\sin\theta\,d\theta\,d\phi`,
 'n(P₁−P₀)':r`n(P_1-P_0)`,'n(Pₙ−Pₙ₋₁)':r`n(P_n-P_{n-1})`,
 '(TRS)⁻¹=S⁻¹R⁻¹T⁻¹':r`(TRS)^{-1}=S^{-1}R^{-1}T^{-1}`,
 'R⁻¹=Rᵀ':r`R^{-1}=R^T`,'RᵀR=I':r`R^TR=I`,
 'L=E+KE+K²E+…':r`L=E+KE+K^2E+\cdots`,'L=E+KL':r`L=E+KL`,
 'max(0,n·l)^p':r`\max(0,n\cdot l)^p`,'max(0,n·l)':r`\max(0,n\cdot l)`,
 'max(0,n·h)^p':r`\max(0,n\cdot h)^p`,
 '(v·u)u':r`(v\cdot u)u`,'v·u':r`v\cdot u`,'u·u':r`u\cdot u`,
 'n·l':r`n\cdot l`,'n·h':r`n\cdot h`,'a×b':r`a\times b`,'b×a':r`b\times a`,
 'g×t':r`g\times t`,'[n]×':r`[n]_\times`,
 'wclip=−z':r`w_{\mathrm{clip}}=-z`,'−w≤x,y,z≤w':r`-w\le x,y,z\le w`,
 'x/(−z)':r`\frac{x}{-z}`,'y/(−z)':r`\frac{y}{-z}`,'A+B/z':r`A+\frac Bz`,
 'h√k<2':r`h\sqrt{k}<2`,'1+kh²':r`1+kh^2`,'1/√N':r`1/\sqrt N`,
 'fs>2fmax':r`f_s>2f_{\max}`,'D=log₂L':r`D=\log_2 L`,'4πr²':r`4\pi r^2`,
 'Φ=4πI':r`\Phi=4\pi I`,'ρ/π':r`\rho/\pi`,'cosθ/π':r`\cos\theta/\pi`,
 'fr·cosθ/pdf':r`f_r\cos\theta/\mathrm{pdf}`,'exp(−σt d)':r`e^{-\sigma_t d}`,
 'm x¨=F':r`m\ddot x=F`,'ẋ=v':r`\dot x=v`,'v̇=F/m':r`\dot v=F/m`,
 'ẏ=f(y,t)':r`\dot y=f(y,t)`,'1/r²':r`1/r^2`,'sr⁻¹':r`\mathrm{sr}^{-1}`,
 'P₀':r`P_0`,'P₁':r`P_1`,'P₂':r`P_2`,'P₃':r`P_3`,'Pₙ':r`P_n`,
 'θ₁':r`\theta_1`,'θ₂':r`\theta_2`,'ℓ₀':r`\ell_0`,'F₀':r`F_0`,
 'C⁰':r`C^0`,'C¹':r`C^1`,'G¹':r`G^1`,
};
const escaped=Object.keys(inlineTokens).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
const tokenPattern=new RegExp(`(${escaped.join('|')})`,'g');
export function RichText({children}){
 const pieces=String(children??'').split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\])/g);
 return <>{pieces.map((piece,i)=>{
  if(/^\$|^\\[(\[]/.test(piece))return <Formula key={i} tex={piece} block={piece.startsWith('$$')||piece.startsWith('\\[')}/>;
  return <React.Fragment key={i}>{piece.split(tokenPattern).map((part,j)=>inlineTokens[part]?<Formula key={j} tex={inlineTokens[part]} block={false}/>:part)}</React.Fragment>;
 })}</>;
}
