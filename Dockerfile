#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
RUN apt update && apt install -y nodejs npm
WORKDIR /src


COPY ["ShowRoom3DTypeScript/package.json", "ShowRoom3DTypeScript/"]
COPY ["ShowRoom3DTypeScript/tsconfig.json", "ShowRoom3DTypeScript/"]
WORKDIR "/src/ShowRoom3DTypeScript"
RUN npm install

COPY ["ShowRoom3DTypeScript.csproj", "ShowRoom3DTypeScript/"]
RUN dotnet restore "ShowRoom3DTypeScript.csproj"

COPY . .

RUN dotnet build "ShowRoom3DTypeScript.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "ShowRoom3DTypeScript.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ShowRoom3DTypeScript.dll"]