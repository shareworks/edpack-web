<template>
  <div class="import-dialog">
    <div :loading="loading">
      <p class="mb-20">
        {{ $t('SW_IMPORT_EXPLAIN_TEXT')}}
      </p>

      <!-- Loading questions -->
      <spinner v-if="status === 'loading'"></spinner>

      <!-- Error -->
      <div v-if="status === 'error'" class="text-muted text-center">
        {{ $t('SW_ERROR_LOADING') }}
      </div>

      <!-- No questions -->
      <div v-if="status === 'none'" class="text-muted text-center">
        {{ $t('SW_NO_QUESTIONS_FOUND') }}
      </div>

      <!-- List of questions -->
      <div v-if="status === 'done'">
        <strong>{{$t('SW_QUESTIONS')}}</strong>

        <el-checkbox-group class="mt-10 line-height-40 mb-20" v-model="selectedQuestions">
          <el-collapse v-model="activeEvalautions" class="results-collapse">
            <el-collapse-item v-for="(evaluation, index) in evaluations" :key="index" :name="index">
              <!-- Question title and number -->
              <template slot="title">
                <span class="evaluation-number">{{index + 1}}</span>
                <span class="evaluation-course">{{ `${evaluation.course.name} - ` }}</span>

                <span class="evaluation-sentence">{{ evaluation.name }}</span>
                <span class="evaluation-course">{{ `(${evaluation.questions.length} question${evaluation.questions.length > 1 ? 's' : ''})` }}</span>
              </template>

              <div v-for="question in evaluation.questions" :key="question._id">
                <el-checkbox class="text-ellipsis block" :label="question._id" :key="question._id">
                  {{question.title[lang]}}
                </el-checkbox>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-checkbox-group>
      </div>

      <!-- Import button -->
      <el-button type="primary" class="mb-20 mr-5" :disabled="!selectedQuestions.length">
        {{ $t('SW_IMPORT') }}
      </el-button>
      <el-button type="text" @click="closeImportDialog()">{{ $t('SW_CANCEL') }}</el-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ImportDialog',
  props: ['closeImportDialog'],

  data () {
    return {
      loading: true,
      dialogPreview: false,
      preview: false,
      school: this.$store.state.school,
      lang: this.$store.state.lang,
      questions: [],
      evaluations: [],
      selectedQuestions: [],
      status: false,
      importCourse: '',
      submitting: false,
      activeEvalautions: [0]
    }
  },

  mounted () {
    this.getQuestions()
  },

  filters: {
    showDate: function (date) { return moment(date).format('ll') }
  },

  methods: {
    getQuestions () {
      this.status = 'loading'

      this.$http.get('/questions', { params: { source: 'custom' } })
        .then((res) => {
          // Give message when no questions found to import
          if (!res.data || !res.data.list || !res.data.list.length) return

          const questions = []
          this.evaluations = res.data.list

          this.questions = questions
          this.selectedQuestions = []

          // if (this.questions.length) this.status = 'done'
          if (this.evaluations.length) this.status = 'done'
          else this.status = 'none'
        })
        .catch(() => { this.$message({ type: 'error', message: this.$i18n.t('SW_GENERIC_ERROR') }) })
    },
    openChat (e) {
      e.preventDefault()
      window.fcWidget.open()
    },
    closeDialog () {
      this.dialogPreview = false
      this.preview = false
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
