<template>
  <el-row type="flex" :gutter="60">
    <el-col :xs="24" :sm="12" :md="12">
      <el-form label-position="top" :model="form" id="messageForm" ref="form" name="contact" label-width="150px" netlify-honeypot="bt-field1" action="thanks-contact" netlify>
        <p class="mb-20">{{ $t('SW_LEAVE_MESSAGE_HERE') }}</p>
        <input type="hidden" name="form-name" value="contact">

        <!-- Name -->
        <el-form-item prop="name" required>
          <el-input :placeholder="$t('SW_YOUR_NAME')" v-model="form.name" name="name">
            <template slot="prepend">
              <i class="icon-user"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- Botfield -->
        <el-form-item prop="name" class="hidden">
          <el-input name="bt-field2"></el-input>
        </el-form-item>

        <!-- Email -->
        <el-form-item prop="email" required>
          <el-input type="email" :placeholder="$t('SW_EMAIL')" v-model="form.email" name="email">
            <template slot="prepend">
              <i class="icon-email"></i>
            </template>
          </el-input>
        </el-form-item>

        <!-- Message -->
        <el-form-item prop="message" required>
          <el-input name="message" :placeholder="$t('SW_MESSAGE')" type="textarea" v-model="form.message" :autosize="{ minRows: 3, maxRows: 6}"></el-input>
        </el-form-item>

        <!-- Send or cancel -->
        <el-form-item>
          <el-button native-type="submit" type="primary" @click="submitMessage">
            <i class="icon-send"></i>
            <strong>{{ $t('SW_SEND_MESSAGE') }}</strong>
          </el-button>
          <el-button @click="closeDialog" class="ml-10" type="text">{{ $t('SW_CANCEL') }}</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!-- Google maps -->
    <el-col class="hidden-xs contact-address" :sm="12" :md="12">
      <gmap-map
        :center="centerMap"
        :options="mapOptions"
        :zoom="6"
        map-type-id="terrain">
        <gmap-info-window :options="infoOptions" :position="position" :opened="infoWinOpen" @closeclick="infoWinOpen=false">
          <span v-html="infoContent"></span>
        </gmap-info-window>
        <gmap-marker :position="position" :clickable="false"></gmap-marker>
      </gmap-map>
    </el-col>
  </el-row>
</template>

<script>
import config from 'config'
import Vue from 'vue'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, { load: { key: config.google_maps_key } })

export default {
  name: 'ContactDialog',
  props: ['closeDialog'],
  components: {},

  data () {
    return {
      mapOptions: { scrollwheel: false, mapTypeControl: false },
      position: { lat: 51.9296064, lng: 4.4742492 },
      centerMap: { lat: 51.93410531, lng: 4.4742492 },
      infoWinOpen: true,
      form: { email: '', name: '', message: '' },
      infoOptions: { pixelOffset: { width: 0, height: -38 } },
      business: config.business
    }
  },

  computed: {
    infoContent () {
      return `<p class="bold">${this.business.name}<br><address>${this.business.streetAddress}<br>${this.business.postAddress}<br>${this.business.country}</address><a href="mailto:${this.business.mail}">${this.business.mail}</a><br><a href="http://goo.gl/maps/SQlrh" class="bold" target="_blank">Get directions</a></p>`
    }
  },

  methods: {
    submitMessage (e) {
      e.preventDefault()

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

      netlify.post(formAction, formData)
        .then(() => {
          this.$message({ message: this.$i18n.t('SW_THANKS_CONTACTING'), type: 'success' })
          this.form = { email: '', name: '', message: '' }
          this.closeDialog()
        })
    }
  }
}
</script>

<style lang="scss">
@import '~scss_vars';
@import './style.scss';
</style>
