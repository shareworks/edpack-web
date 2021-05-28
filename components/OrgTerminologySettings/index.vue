<template>
  <div :class="{ 'multi-lang': form.languages.en && form.languages.nl }">
    <!-- Faculty term -->
    <el-form-item v-if="terminologyList.includes('faculty')" :label="$t('SW_ORG_FACULTYTERM_NAME')" required>
      <inputs-with-flags :change="setNewFaculty" :value="form.terminology.faculty" name="facultyTerm"/>
    </el-form-item>

    <!-- Faculties term -->
    <el-form-item v-if="terminologyList.includes('faculty')" :label="$t('SW_ORG_FACULTIESTERM_NAME')" required>
      <inputs-with-flags :change="setNewFaculties" :value="form.terminology.faculties" name="facultiesTerm"/>
    </el-form-item>

    <!-- Student term -->
    <el-form-item v-if="terminologyList.includes('student')" :label="$t('SW_ORG_STUDENT_TERM_NAME')" required>
      <inputs-with-flags :change="setNewStudent" :value="form.terminology.student" name="studentTerm"/>
    </el-form-item>

    <!-- Students term -->
    <el-form-item v-if="terminologyList.includes('student')" :label="$t('SW_ORG_STUDENTS_TERM_NAME')" required>
      <inputs-with-flags :change="setNewStudents" :value="form.terminology.students" name="studentsTerm"/>
    </el-form-item>

    <!-- Instructor term -->
    <el-form-item v-if="terminologyList.includes('instructor')" :label="$t('SW_ORG_INSTRUCTOR_TERM_NAME')" required>
      <inputs-with-flags :change="setNewInstructor" :value="form.terminology.instructor" name="instructorTerm"/>
    </el-form-item>

    <!-- Instructors term -->
    <el-form-item v-if="terminologyList.includes('instructor')" :label="$t('SW_ORG_INSTRUCTORS_TERM_NAME')" required>
      <inputs-with-flags :change="setNewInstructors" :value="form.terminology.instructors" name="instructorsTerm"/>
    </el-form-item>

    <!-- Plan term -->
    <el-form-item :label="$t('SW_ORG_PLANTERM_NAME')"  v-if="terminologyList.includes('plan') && school.enablePlans" required>
      <inputs-with-flags :change="setNewPlan" :value="form.terminology.plan" name="planTerm"/>
    </el-form-item>

    <!-- Plans term -->
    <el-form-item :label="$t('SW_ORG_PLANSTERM_NAME')"  v-if="terminologyList.includes('plan') && school.enablePlans" required>
      <inputs-with-flags :change="setNewPlans" :value="form.terminology.plans" name="plansTerm"/>
    </el-form-item>
  </div>
</template>

<script>
import config from 'config'
import InputsWithFlags from '../InputsWithFlags'
export default {
  name: 'OrgTerminologySettings',
  props: ['form'],
  components: { InputsWithFlags },

  data () {
    return {
      terminologyList: config.terminologyList,
      usePlansTerminology: config.usePlansTerminology,
      school: this.$store.state.school,
      user: this.$store.state.user,
      lang: this.$store.state.lang
    }
  },

  methods: {
    setNewFaculty (lang, value) { this.form.terminology.faculty[lang] = value },
    setNewFaculties (lang, value) { this.form.terminology.faculties[lang] = value },
    setNewPlan (lang, value) { this.form.terminology.plan[lang] = value },
    setNewPlans (lang, value) { this.form.terminology.plans[lang] = value },
    setNewStudent (lang, value) { this.form.terminology.student[lang] = value },
    setNewStudents (lang, value) { this.form.terminology.students[lang] = value },
    setNewInstructor (lang, value) { this.form.terminology.instructor[lang] = value },
    setNewInstructors (lang, value) { this.form.terminology.instructors[lang] = value }
  }
}
</script>
