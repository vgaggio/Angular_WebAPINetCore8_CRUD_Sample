# Imagen base para ejecutar la aplicación
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copiar los binarios preconstruidos de la API al contenedor
# Espera que los binarios estén en la carpeta "api" en el contexto
COPY ./api/ .

# Exponer los puertos 80 (HTTP) y 443 (HTTPS)
EXPOSE 80
EXPOSE 443

# Configurar las URLs para que la aplicación escuche en HTTP y HTTPS
ENV ASPNETCORE_URLS="http://+:80"
#;https://+:443"

# Comando para ejecutar la aplicación
ENTRYPOINT ["dotnet", "EmployeeCrudApi.dll"]
#CMD ["/bin/bash"]
