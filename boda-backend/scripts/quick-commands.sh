#!/bin/bash

# ==================================================
# COMANDOS RÁPIDOS PARA PRODUCCIÓN
# ==================================================

echo "Selecciona una opción:"
echo ""
echo "1) Reiniciar todos los servicios"
echo "2) Ver logs en tiempo real"
echo "3) Limpiar caché de Laravel"
echo "4) Ejecutar migraciones"
echo "5) Crear superadministrador"
echo "6) Ver estado de contenedores"
echo "7) Reconstruir y reiniciar"
echo "8) Verificar conexión a BD"
echo "9) Salir"
echo ""
read -p "Opción: " option

case $option in
  1)
    echo "Reiniciando servicios..."
    docker-compose -f docker-compose.prod.yml restart
    echo "✅ Servicios reiniciados"
    ;;
  2)
    echo "Mostrando logs (Ctrl+C para salir)..."
    docker-compose -f docker-compose.prod.yml logs -f
    ;;
  3)
    echo "Limpiando caché..."
    docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
    docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
    docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
    docker-compose -f docker-compose.prod.yml exec app php artisan view:clear
    echo "✅ Caché limpiado"
    ;;
  4)
    echo "Ejecutando migraciones..."
    docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
    echo "✅ Migraciones ejecutadas"
    ;;
  5)
    echo "Creando superadministrador..."
    docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=SuperAdminSeeder --force
    echo "✅ Superadministrador creado"
    echo "   Email: redy.delgado@gmail.com"
    echo "   Password: R3DY-ARDOS"
    ;;
  6)
    echo "Estado de contenedores:"
    docker-compose -f docker-compose.prod.yml ps
    ;;
  7)
    echo "Reconstruyendo y reiniciando..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml up -d --build
    echo "✅ Servicios reconstruidos"
    ;;
  8)
    echo "Verificando conexión a base de datos..."
    docker-compose -f docker-compose.prod.yml exec mysql mysql -u db_wedding -psecret123 -e "SHOW DATABASES;"
    ;;
  9)
    echo "Saliendo..."
    exit 0
    ;;
  *)
    echo "Opción inválida"
    exit 1
    ;;
esac
