import DashboardLayout from '../components/Layout/DashboardLayout.vue'
// GeneralViews
import NotFound from '../components/GeneralViews/NotFoundPage.vue'

// Admin pages
import Overview     from 'src/components/Pages/Overview.vue'
import OIDLogin     from 'src/components/Pages/OidLogin.vue'
import TestAccount  from 'src/components/Pages/TestAccount.vue'
import OIDShow      from 'src/components/Pages/OidshowInfo.vue'
import Issue        from 'src/components/Pages/Issue.vue'
import Signtc       from 'src/components/Pages/Signtc.vue'
import UserProfile  from 'src/components/Pages/UserProfile.vue'
import Certlist     from 'src/components/Pages/Certlist.vue'
import SignInfoList from 'src/components/Pages/SignInfoList.vue'
import Verify       from 'src/components/Pages/Verify.vue'
import Admin        from 'src/components/Pages/Admin.vue'
import QRCodeVerify from 'src/components/Pages/QRCodeVerify.vue'
import DevDemoModal from 'src/components/Demo/DevDemoModal.vue'
import IpfsMainPage from 'src/components/Pages/IpfsMainPage.vue'
import IpfsVerify from 'src/components/Pages/IpfsVerify.vue'
import RevokeApply from 'src/components/Pages/RevokeApply.vue'
import RevokeTrace from 'src/components/Pages/RevokeTrace.vue'
import RevokeDump from 'src/components/Pages/RevokeDump.vue'
import IssueStud from 'src/components/Pages/IssueStud.vue'

const routes = [{
    path: '/',
    component: DashboardLayout,
    redirect: '/overview',
    children: [{
        path: 'overview',
        name: '關於平台(About)',
        component: Overview
      },
      {
        path: 'userinfo',
        name: '個人資訊',
        component: UserProfile
      },
      {
        path: 'oidlogin',
        name: 'OpenID登入',
        component: OIDLogin
      },
      {
        path: 'issue',
        name: '發行證書',
        component: Issue
      },
      {
        path: 'issuestud',
        name: '發行證書',
        component: IssueStud
      },
      {
        path: 'signcert',
        name: '發起人簽署',
        component: Signtc
      },
      {
        path: 'certlist',
        name: '查詢個人證書',
        component: Certlist
      },
      {
        path: 'signinfo',
        name: '追蹤發行狀態',
        component: SignInfoList
      },
      {
        path: 'oid/test/callback',
        name: 'ShowOid個人資料',
        component: OIDShow
      },
      {
        path: 'verify',
        name: '電子檔驗證',
        component: Verify
      },
      {
        path: 'devdemomodal',
        name: 'Development Demo Modal',
        component: DevDemoModal
      },
      {
        path: 'admin',
        name: '管理者頁面',
        component: Admin
      },
      {
        path: 'qrcodeverify',
        name: 'QRCodeVerify',
        component: QRCodeVerify
      },
      {
        path: 'ipfsapply',
        name: '時效性證書申請',
        component: IpfsMainPage
      },
      {
        path: 'ipfsverify',
        name: '驗證時效性證書',
        component: IpfsVerify
      },
      {
        path: 'revokeapply',
        name: '申請證書撤銷',
        component: RevokeApply
      },
      {
        path: 'revoketrace',
        name: '待簽章證書列表',
        component: RevokeTrace
      },
      {
        path: 'revokedump',
        name: '撤銷證書一覽',
        component: RevokeDump
      },
      {
        path: 'testaccount',
        name: '測試帳號',
        component: TestAccount
      }
    ]
  },
  {
    path: '/oid',
    component: DashboardLayout,
    redirect: '/oid/test/callback',
    children: []
  },
  {
    path: '*',
    component: NotFound
  }
]

export default routes
