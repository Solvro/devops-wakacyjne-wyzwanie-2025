{{/*
Expand the name of the chart.
*/}}
{{- define "webapp-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "webapp-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "webapp-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "webapp-chart.labels" -}}
helm.sh/chart: {{ include "webapp-chart.chart" . }}
{{ include "webapp-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app: {{ .Values.app.name }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "webapp-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "webapp-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "webapp-chart.backend.labels" -}}
{{ include "webapp-chart.labels" . }}
tier: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "webapp-chart.backend.selectorLabels" -}}
{{ include "webapp-chart.selectorLabels" . }}
tier: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "webapp-chart.frontend.labels" -}}
{{ include "webapp-chart.labels" . }}
tier: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "webapp-chart.frontend.selectorLabels" -}}
{{ include "webapp-chart.selectorLabels" . }}
tier: frontend
{{- end }}

{{/*
Database labels
*/}}
{{- define "webapp-chart.database.labels" -}}
{{ include "webapp-chart.labels" . }}
tier: database
{{- end }}

{{/*
Database selector labels
*/}}
{{- define "webapp-chart.database.selectorLabels" -}}
{{ include "webapp-chart.selectorLabels" . }}
tier: database
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "webapp-chart.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "webapp-chart.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database connection string
*/}}
{{- define "webapp-chart.databaseUrl" -}}
postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@{{ include "webapp-chart.postgresql.serviceName" . }}:5432/{{ .Values.app.name }}
{{- end }}

{{/*
Backend service name
*/}}
{{- define "webapp-chart.backend.serviceName" -}}
{{ include "webapp-chart.fullname" . }}-backend
{{- end }}

{{/*
Frontend service name
*/}}
{{- define "webapp-chart.frontend.serviceName" -}}
{{ include "webapp-chart.fullname" . }}-frontend
{{- end }}

{{/*
PostgreSQL service name
*/}}
{{- define "webapp-chart.postgresql.serviceName" -}}
{{ include "webapp-chart.fullname" . }}-postgresql
{{- end }}
