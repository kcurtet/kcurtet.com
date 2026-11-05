---
title: "10 · Entra ID (Azure AD) y entornos híbridos"
description: "Los helpdesks de hoy administran dos directorios que comparten apellido pero no ADN. Entender qué se gestiona dónde es exactamente lo que pregunta el entrevistador moderno."
curso: "active-directory"
capitulo: 10
orden: 10
---
> «Los helpdesks de hoy administran dos directorios que comparten apellido pero no ADN. Entender qué se gestiona dónde es exactamente lo que pregunta el entrevistador moderno.»

## Objetivos

- Explicar qué es Entra ID y en qué se parece —y no se parece— a AD DS.
- Entender el entorno híbrido: Entra Connect, Password Hash Sync vs PTA, y qué fluye hacia dónde.
- Distinguir los tres estados de dispositivo (registered / joined / hybrid joined).
- Saber las tareas L1 típicas del lado nube y no morir en el intento.

## 10.1 Dos directorios, dos filosofías

**Microsoft Entra ID** (antes Azure AD) es el servicio de identidad en la nube de Microsoft: el que da login a Microsoft 365, Teams, el portal de Azure, y miles de apps SaaS. **No es «tu AD en la nube»**: es otro producto con otra arquitectura.

| | **AD DS** (on-prem) | **Entra ID** |
|---|---------------------|--------------|
| Protocolos | LDAP, Kerberos, NTLM | OAuth 2.0 / OIDC / SAML (web tokens) |
| Estructura | Dominios, OUs, árboles, bosque | Plano: usuarios, grupos, apps. Sin OUs |
| Configuración de equipos | GPOs | No tiene (eso lo hace **Intune/MDM**) |
| Autenticación fuerte | Tarjetas/certificados, legacy | **MFA** y **Conditional Access** nativos |
| Máquinas | Cuentas de equipo, join | Entra join / hybrid join / registered |
| Dónde vive | Tus DCs | Datacenters de Microsoft |
| Administración | ADUC/RSAT/PowerShell | Portal de Entra / Graph / admin center |

> **Para tu cerebro Linux:** si AD DS es FreeIPA (LDAP+Kerberos con gestión de máquinas), Entra ID es más bien un IdP tipo Keycloak/Auth0/Okta: emite tokens web (OIDC) a aplicaciones, con MFA y políticas de acceso condicional. La analogía te servirá también para entender por qué *no* hay GPOs: la gestión de endpoint se delega a MDM (Intune).

## 10.2 El híbrido: por qué existen los dos a la vez

La mayoría de empresas reales tiene usuarios nacidos en AD DS (on-prem) que también necesitan Microsoft 365. La pieza que los une es **Microsoft Entra Connect** (antes Azure AD Connect): un sincronizador instalado on-prem que **copia identidades de AD DS hacia Entra ID** cada ~30 minutos (delta sync).

Tres formas de que el usuario se autentique contra la nube — la pregunta clásica:

| Modo | Cómo funciona | Qué implica |
|------|---------------|-------------|
| **PHS** (Password Hash Sync) | El hash de la contraseña de AD se sincroniza a Entra ID y la nube valida directamente | El más común; permite que un cambio de contraseña en AD llegue a la nube; sobrevive a caídas on-prem |
| **PTA** (Pass-through Authentication) | Un agente on-prem valida la contraseña contra AD cuando la nube la pide | La contraseña nunca va a la nube; requiere agentes sanos on-prem |
| **Federación** (AD FS legacy) | Un IdP propio (AD FS) hace la autenticación y la nube confía en él | Lo más legacy/migración en curso; verás empresas saliendo de esto |

Con PHS (y Entra Connect configurado para ello) existe el **password writeback**: un reset hecho en la nube (M365) se escribe *de vuelta* a AD DS. Detalle L1 clave: dónde reseteas la contraseña depende de dónde esté el usuario y qué sync tenga la empresa — cuando dudes: pregunta «¿reset en AD, en Entra o ambos?».

También existe **Entra Domain Services** (un DC-as-a-service en Azure compatible con dominios clásicos) — saber que existe; es nicho.

**Dirección del flujo (memoriza):** objetos creados on-prem → suben a la nube; usuarios *cloud-only* viven solo en Entra. Un objeto sincronizado se gestiona on-prem (si lo editas en la nube, el próximo sync lo pisa) — error clásico de N1 novel.

## 10.3 Dispositivos: registered, joined, hybrid joined

| Estado | Qué es | Típico en |
|--------|--------|-----------|
| **Entra registered** | Dispositivo *personal* registrado para SSO a servicios cloud (BYOD: móvil, PC propio) | Móviles con apps corporativas |
| **Entra joined** | Equipo corporativo unido *solo* a Entra ID (sin AD DS) | Empresas cloud-only, gestiona Intune |
| **Hybrid joined** | Equipo unido a AD DS on-prem **y además** registrado en Entra ID por Entra Connect | La mayoría de empresas tradicionales |

Se comprueba en el equipo con `dsregcmd /status` (campos `AzureAdJoined`, `DomainJoined`). ¿Por qué te importa? Porque el **Conditional Access** (políticas de acceso condicional de Entra) exige con frecuencia «dispositivo híbrido unido y conforme» para entrar a los servicios: un equipo que no completó el hybrid join se queda fuera de Teams/SharePoint aunque las credenciales sean válidas — y ese ticket es pan de cada día en helpdesk híbrido.

## 10.4 El día a día L1 en híbrido

Tareas típicas que te van a caer del lado nube:

- **Reset de contraseña en M365/Entra** (con writeback si existe) — mismo workflow mental que AD: reset + forzar cambio.
- **MFA atascado**: usuario cambió de móvil y no puede aprobar el segundo factor → re-registrar métodos (pedir a Identity/seguridad el rol correcto o escalar según política).
- **«No me llega el código MFA»** → método alternativo, revisar número de teléfono de los métodos, o re-register.
- **Conditional Access bloqueando** a un usuario (viaje, dispositivo no conforme) → identificar la política en el mensaje de error y escalar/regularizar el dispositivo (Intune compliance).
- **Licencias**: usuario sin licencia → Teams/correo no funciona aunque la cuenta exista. Chequeo rápido en el admin center.
- **Sync no llega**: usuario creado hace 1 h y no aparece en la nube → ¿delta sync pendiente? (N2 puede forzar `Start-ADSyncSyncCycle`), ¿filtrado por OU?

Certificaciones que cubren este mundo y complementan tu perfil: **AZ-900** (fundamentos Azure, incluye Entra básico), **SC-900** (fundamentos de seguridad: identidad Entra — la más rentable para ti), **MD-102** (Endpoint Administrator: Intune + identidad híbrida, la de helpdesk moderno).

## Esto te preguntarán en la entrevista

**P: ¿Diferencia entre AD DS y Entra ID (Azure AD)?**
R: AD DS es el directorio on-prem: LDAP, Kerberos, OUs y GPOs, vive en tus DCs. Entra ID es el IdP cloud de Microsoft: protocolos web (OIDC/SAML), estructura plana sin OUs ni GPOs (la gestión de endpoint la hace Intune), MFA y Conditional Access nativos. Se complementan en entornos híbridos.

**P: ¿Qué es Microsoft Entra Connect?**
R: El conector que sincroniza identidades de AD DS hacia Entra ID (delta sync cada ~30 min). Los objetos sincronizados se gestionan desde on-prem. Permite Password Hash Sync, Pass-through Authentication o federación, y con PHS el password writeback: un reset en la nube vuelve a AD.

**P: ¿PHS vs PTA?**
R: Con PHS el hash de contraseña se sincroniza a Entra ID y la nube valida sola — el más común, robusto ante caídas on-prem. Con PTA un agente on-prem valida cada login contra AD en el momento; la contraseña no se sincroniza, pero dependes de los agentes.

**P: ¿Qué significa que un equipo esté «hybrid joined»?**
R: Que está unido al AD DS on-prem y además registrado en Entra ID vía la sincronización de dispositivos. Lo exige muchas veces el Conditional Access. Se comprueba con `dsregcmd /status`.

**P: Un usuario no puede entrar a Teams desde el aeropuerto. ¿Ideas?**
R: Escenario típico de Conditional Access: ubicación/dispositivo no conforme o MFA pendiente. Identifico la política del mensaje, compruebo el estado del dispositivo (hybrid join/Intune compliance) y los métodos MFA del usuario; según la política, regularizo el dispositivo o escalo a quien gestiona las políticas CA.

## Ejercicios prácticos

1. **De papel:** dibuja el flujo completo: alta de usuario en AD DS → sync → aparece en Entra → licencia M365 → login en Teams. Marca en qué paso puede fallar cada síntoma: «no aparece en la nube», «no puede hacer login en M365», «Teams le dice sin licencia».
2. **De papel:** para una empresa con AD DS, M365 con PHS+writeback y portátiles hybrid joined, responde: (a) ¿dónde reseteas una contraseña? (b) ¿dónde creas un usuario nuevo cloud-only? (c) ¿por qué un equipo recién reparado no entra a Teams aunque las credenciales van bien?
3. **Manos libres:** crea una cuenta gratuita de desarrollador M365 (o usa el modo trial de empresa si puedes) y navega: usuarios, grupos, MFA, Conditional Access (visualizar), licencias. Objetivo: reconocer las pantallas cuando las nombren.
4. **De papel:** explica a un compañero imaginario por qué «borré el usuario en la nube y ha vuelto a aparecer» (sync desde on-prem lo recrea: los objetos sincronizados se gestionan en origen).
