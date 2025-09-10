{{- define "webapp.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "webapp.fullname" -}}
{{ include "webapp.name" . }}-{{ .Release.Name }}
{{- end }}

{{- define "webapp.labels" -}}
app.kubernetes.io/name: {{ include "webapp.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}