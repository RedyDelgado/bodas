# 🚀 CONFIGURAR GOOGLE DRIVE - GUÍA RÁPIDA

## 🎯 Ejecuta SOLO este comando:

```powershell
cd c:\xampp\htdocs\wedding
.\CONFIGURAR-RCLONE.ps1
```

## 📋 Durante el proceso, responde:

| Pregunta | Tu Respuesta |
|----------|-------------|
| `e/n/d/r/c/s/q>` | **n** |
| `name>` | **gdrive** |
| `Storage>` | **15** |
| `client_id>` | *[ENTER vacío]* |
| `client_secret>` | *[ENTER vacío]* |
| `scope>` | **1** |
| `root_folder_id>` | *[ENTER vacío]* |
| `service_account_file>` | *[ENTER vacío]* |
| `Edit advanced config>` | **n** |
| `Use auto config>` | **n** ⚠️ |

## 🌐 Autorización de Google:

1. Copia el enlace que aparece
2. Ábrelo en tu navegador
3. Inicia sesión con: **miwebdebodas.notificacion@gmail.com**
4. Acepta los permisos
5. Copia el código
6. Pégalo donde dice `Enter verification code>`

## ✅ Finalizar:

| Pregunta | Tu Respuesta |
|----------|-------------|
| `Keep this 'gdrive' remote>` | **y** |
| `e/n/d/r/c/s/q>` | **q** |

## 🎉 Después:

1. Ve a: http://localhost:5173/admin/backups
2. Configuración → Remote: **gdrive:/backups-miwebdebodas**
3. Habilita backups ✓
4. Ejecuta Backup

¡Listo! 🚀

---

## 🆘 Si algo falla:

```powershell
# Ver configuración actual
docker compose exec app rclone listremotes

# Probar conexión
docker compose exec app rclone lsd gdrive:

# Reconfigurar
docker compose exec -it app rclone config
```
