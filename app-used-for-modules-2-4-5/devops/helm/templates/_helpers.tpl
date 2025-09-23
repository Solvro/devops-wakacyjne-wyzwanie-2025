{{/*
Expand the name of the chart.
*/}}
{{- define "budzetownik-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "budzetownik-chart.fullname" -}}
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
{{- define "budzetownik-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "budzetownik-chart.labels" -}}
helm.sh/chart: {{ include "budzetownik-chart.chart" . }}
{{ include "budzetownik-chart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app: {{ .Values.app.name }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "budzetownik-chart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "budzetownik-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Backend labels
*/}}
{{- define "budzetownik-chart.backend.labels" -}}
{{ include "budzetownik-chart.labels" . }}
tier: backend
{{- end }}

{{/*
Backend selector labels
*/}}
{{- define "budzetownik-chart.backend.selectorLabels" -}}
{{ include "budzetownik-chart.selectorLabels" . }}
tier: backend
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "budzetownik-chart.frontend.labels" -}}
{{ include "budzetownik-chart.labels" . }}
tier: frontend
{{- end }}

{{/*
Frontend selector labels
*/}}
{{- define "budzetownik-chart.frontend.selectorLabels" -}}
{{ include "budzetownik-chart.selectorLabels" . }}
tier: frontend
{{- end }}

{{/*
Database labels
*/}}
{{- define "budzetownik-chart.database.labels" -}}
{{ include "budzetownik-chart.labels" . }}
tier: database
{{- end }}

{{/*
Database selector labels
*/}}
{{- define "budzetownik-chart.database.selectorLabels" -}}
{{ include "budzetownik-chart.selectorLabels" . }}
tier: database
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "budzetownik-chart.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "budzetownik-chart.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database connection string
*/}}
{{- define "budzetownik-chart.databaseUrl" -}}
postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@{{ include "budzetownik-chart.postgresql.serviceName" . }}:5432/{{ .Values.app.name }}
{{- end }}

{{/*
Backend service name
*/}}
{{- define "budzetownik-chart.backend.serviceName" -}}
{{ include "budzetownik-chart.fullname" . }}-backend
{{- end }}

{{/*
Frontend service name
*/}}
{{- define "budzetownik-chart.frontend.serviceName" -}}
{{ include "budzetownik-chart.fullname" . }}-frontend
{{- end }}

{{/*
PostgreSQL service name
*/}}
{{- define "budzetownik-chart.postgresql.serviceName" -}}
{{ include "budzetownik-chart.fullname" . }}-postgresql
{{- end }}
