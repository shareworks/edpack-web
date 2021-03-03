<template>
  <el-row type="flex" :gutter="60">
    <el-col :xs="24" :sm="12" :md="12">
      <el-form label-position="top" :model="form" id="messageForm" ref="form" name="contact" label-width="150px" netlify-honeypot="bt-field1" action="thanks-contact" netlify>
        <p class="mb-20">{{ $t('SW_LEAVE_MESSAGE_HERE') }}</p>
        <input type="hidden" name="form-name" value="contact">

        <!-- Name -->
        <el-form-item prop="name" required class="contact-form-item">
          <el-input ref="nameInput" :placeholder="$t('SW_YOUR_NAME')" v-model="form.name" :disabled="!!user.name" name="name">
            <template slot="prepend">
              <i class="icon-user"/>
            </template>
          </el-input>
        </el-form-item>

        <!-- Botfield -->
        <el-form-item prop="name" class="hidden">
          <el-input name="bt-field2"/>
        </el-form-item>

        <!-- Email -->
        <el-form-item prop="email" required class="contact-form-item">
          <el-input type="email" :placeholder="$t('SW_SCHOOL_EMAIL')" v-model="form.email" :disabled="!!user.email" name="email">
            <template slot="prepend">
              <i class="icon-email"/>
            </template>
          </el-input>
        </el-form-item>

        <!-- Message -->
        <el-form-item prop="message" required class="contact-form-item">
          <el-input name="message" :placeholder="$t('SW_MESSAGE')" type="textarea" v-model="form.message" :autosize="{ minRows: 3, maxRows: 6}"/>
        </el-form-item>

        <!-- URL -->
        <el-form-item prop="url" required class="hidden">
          <el-input name="url" type="text" placeholder="Url" v-model="form.url"/>
        </el-form-item>

        <!-- Send or cancel -->
        <el-form-item class="contact-form-item">
          <el-button native-type="submit" type="primary" @click.prevent="submitMessage">
            <i class="icon-send"></i>
            <strong>{{ $t('SW_SEND_MESSAGE') }}</strong>
          </el-button>
          <el-button @click="cancel" class="ml-10" type="text">{{ $t('SW_CANCEL') }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!-- Google maps -->
    <el-col class="hidden-xs contact-address" :sm="12" :md="12">
      <gmap-map :center="centerMap" :options="mapOptions" :zoom="6" map-type-id="terrain">
        <gmap-info-window :options="infoOptions" :position="position" :opened="infoWinOpen" @closeclick="infoWinOpen=false">
          <span v-html="infoContent"/>
        </gmap-info-window>
        <gmap-marker :position="position" :clickable="false"/>
      </gmap-map>
    </el-col>
  </el-row>
</template>

<script>
import Vue from 'vue'
import config from 'config'
import * as VueGoogleMaps from 'gmap-vue'

Vue.use(VueGoogleMaps, { load: { key: config.google_maps_key }, installComponents: true })

export default {
  name: 'ContactForm',
  props: ['closeDialog'],

  data () {
    return {
      mapOptions: { scrollwheel: false, mapTypeControl: false },
      position: config.map.position,
      centerMap: config.map.centerMap,
      infoWinOpen: true,
      user: this.$store.state.user || {},
      form: {
        email: this.$store.state.user && this.$store.state.user.email ? this.$store.state.user.email : '',
        name: this.$store.state.user && this.$store.state.user.name ? this.$store.state.user.name : '',
        message: '',
        school: this.$store.state.school?._id,
        url: window.location.href
      },
      infoOptions: { pixelOffset: { width: 0, height: -38 } },
      business: config.business
    }
  },

  computed: {
    infoContent () {
      const b = this.business
      const mapsUrl = config.mapsUrl
      // Company address
      return `<p class="bold">${b.name}<br><address>${b.streetAddress}<br>${b.postAddress}<br>${b.country}</address><a href="mailto:${b.mail}">${b.mail}</a><br><a href="${mapsUrl}" class="bold" target="_blank">${ this.$i18n.t('SW_GET_DIRECTION') }</a></p>`
    }
  },

  mounted () {
    this.$nextTick(() => this.$refs.nameInput.focus())
  },

  methods: {
    submitMessage () {
      // Basic validation
      if (!this.form.name || !this.form.message || this.form.email.indexOf('@') < 0) {
        return this.$message({ message: this.$i18n.t('SW_FILL_REQUIRED'), type: 'error' })
      }

      const form = document.forms.namedItem('contact')
      const formAction = form.getAttribute('action')
      const formData = new FormData(form)

      const netlify = this.$http.create({
        baseURL: `${config.web_url}/`,
        timeout: 10000,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      // Add additional info to easily find a bug
      formData.set('fullPath', this.$route.fullPath)
      if (this.user?._id) {
        formData.set('userId', this.user._id)
      }

      netlify.post(formAction, formData)
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_THANKS_CONTACTING'), type: 'success' })
          this.form = { email: '', name: '', message: '' }
          this.closeDialog()
        })
        .catch(e => { console.log(e) })
    },
    cancel () {
      if (this.closeDialog) return this.closeDialog()
      else this.form = { email: '', name: '', message: '' }
    }
  }
}
</script>

<style lang="scss">
  @import '~scss_vars';
  @import './style.scss';
</style>
