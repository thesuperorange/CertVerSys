<template>
  <div>
  <p>財團法人國家實驗研究院國家高速網路與計算中心，配合台中市政府發展「智慧校園」，撰寫此「畢業證書驗證系統」，提供台中市中、小學試用。</p>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2"><div class="icon-big text-center icon-success"><i class="ti-wallet"></i></div></div>
            <div class="col-xs-10"><h4 class="title" slot="title">計畫目標</h4>
            <span slot="subTitle">System Purpose<br><br></span></div>
          </div>
          <div class="content">
            <div >
              1.區塊鏈儲存「畢業證書驗證碼」(hash value) 提供驗證<br>
              2.可透過QRcode驗證學生畢業證書的正確性  (目前已知系統中之首創功能)<br>(QR code 並非僅直接由雲端下載整份畢業證書)<br>
              3.學生查詢畢業證書資訊、畢業證書進度確認<br>
              4.提供使用者介面讓教務處、教授能夠透過此介面驗證上傳畢業證書、驗證畢業證書正確性的機制及學生查看自己資料的機制<br>
              5.資料傳輸時加密處理，避免惡意使用者知道其他人資訊  (目前已知系統中之首創功能)<br>
              6. 純分散式儲存，完全教務處、驗證伺服器皆無儲存證書檔案
            </div>

            <div class="footer">
              <div class="chart-legend"></div>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2"><div class="icon-big text-center icon-warning"><i class="ti-server"></i></div></div>
            <div class="col-xs-10"><h4 class="title" slot="title">系統架構說明</h4>
            <span slot="subTitle">System structure<br><br></span></div>
          </div>
          <div class="content">
            <div >
               我們運用了區塊鏈(blockchain)、分散式儲存系統(IPFS)兩種概念進行系統規劃。利用區塊鍊中的不可竄改性將畢業證書等類的「雜湊資訊」放在區塊鏈上提供未來驗證。並且使用「智慧合約」來限定核發證書的人員，驗證成功則會產生簽章完成的畢業證書電子檔。
            </div>
            <div class="footer">
              <div class="chart-legend"></div>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2"><div class="icon-big text-center icon-info"><i class="ti-twitter-alt"></i></div></div>
            <div class="col-xs-10"><h4 class="title" slot="title">開發團隊</h4>
            <span slot="subTitle">Team member<br><br></span></div>
            
          </div>
          <div class="content">
            <div class="row">
              <div class="col-xs-12">
                國家實驗研究院國網中心 葉羅堯 \
                國家實驗研究院國網中心 盧沛怡 \
                國家實驗研究院國網中心 黃程風 \<br>
                國家實驗研究院國網中心 林忠義 \
                國家實驗研究院國網中心 洪嘉賢 \
                國立台灣大學資訊工程系 張均銘 
                <br>  
              </div>
            </div>
            <div class="footer">
              <div class="chart-legend"></div>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
<script>

</script>
<style>

</style>
