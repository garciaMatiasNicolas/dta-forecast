import React from 'react'
import logo from "../assets/logowhite.png";
import '../Home.css'
import { Link } from 'react-router-dom';


const Home = (props) => {
  return (
    <div className="home-container" style={{background: "#FFFF"}}>
      <animate-on-reveal
        animation="none"
        duration="300ms"
        delay="0s"
        direction="normal"
        easing="ease"
        iteration="1"
      >
        <div data-thq-animate-on-reveal="true" className="home-frame36">
          <img src={logo} alt="image" className="home-image" />
          <div className="home-group2228">
            <div className="home-heading-name">
              <div className="home-menu-item-default1">
                <Link to="https://www.dtalogistica.com/">
                  <a className="home-text02">
                    Sobre nosotros
                  </a>
                </Link>
              </div>
              <div className="home-menu-item-default2">
                <a href="#product" className="home-text02">Producto</a>
              </div>
              <div className="home-menu-item-default3">
                <a className="home-text03" href='#clients'>
                  Clientes
                </a>
              </div>
              <div className="home-menu-item-default4">
                <span className="home-text03 BodyRegularBody2">
                  <span>FAQ</span>
                </span>
              </div>
            </div>
          </div>
          <div className="home-login">
            <Link to={'/login'}>
              <button className="home-button">
                <span className="home-text06">
                  Iniciar sesion
                </span>
              </button>
            </Link>
          </div>
        </div>
      </animate-on-reveal>
      <div className="home-home">
        <div className="home-hero-section">
          <div className="home-frame1">
            <div className="home-text07">
              <span className="home-text08">
                Descubre el poder del forecast con DTA
              </span>
              <span className="home-text09 BodyRegularBody2">
                Mejora tus decisiones con prónisticos precisos y lleva tu
                negocio al próximo nivel!
              </span>
            </div>
            <Link to={'/signup'}>
              <button className="home-button1">
                <span className="home-text10">Registrarme</span>
              </button>
            </Link>
          </div>
          <div className="home-container1">
            <img
              src="/external/illustration1091-6sye.svg"
              alt="Illustration1091"
              className="home-illustration"
            />
          </div>
        </div>
        <animate-on-reveal
          animation="fadeIn"
          duration="600ms"
          delay="0s"
          direction="normal"
          easing="ease"
          iteration="1"
        >
          <div data-thq-animate-on-reveal="true" className="home-clients" id='clients'>
            <div className="home-clients1">
              <span className="home-text11 HeadingHeadline2">
                Nuestros clientes
              </span>
              <span className="home-text12">
                Venimos trabajando con +50 clientes que confian en nuestra
                plataforma
              </span>
            </div>
            <div className="home-clients-logos">
              <div className="home-logo">
                <img
                  src="/external/logo2118-l8cj.svg"
                  alt="Logo2118"
                  className="home-logo01"
                />
              </div>
              <div className="home-logo02">
                <img
                  src="/external/logo2118-ywdv.svg"
                  alt="Logo2118"
                  className="home-logo03"
                />
              </div>
              <div className="home-logo04">
                <img
                  src="/external/logo2118-t7wi.svg"
                  alt="Logo2118"
                  className="home-logo05"
                />
              </div>
              <div className="home-logo06">
                <img
                  src="/external/logo2118-b4rc.svg"
                  alt="Logo2118"
                  className="home-logo07"
                />
              </div>
              <div className="home-logo08">
                <img
                  src="/external/logo2118-js3k.svg"
                  alt="Logo2118"
                  className="home-logo09"
                />
              </div>
              <div className="home-logo10">
                <img
                  src="/external/logo2118-s5n.svg"
                  alt="Logo2118"
                  className="home-logo11"
                />
              </div>
              <div className="home-logo12">
                <img
                  src="/external/logo2118-qxb.svg"
                  alt="Logo2118"
                  className="home-logo13"
                />
              </div>
            </div>
          </div>
        </animate-on-reveal>
        <animate-on-reveal
          animation="fadeIn"
          duration="600ms"
          delay="0s"
          direction="normal"
          easing="ease"
          iteration="1"
        >
          <div data-thq-animate-on-reveal="true" className="home-community" id='product'>
            <div className="home-community1">
              <span className="home-text13 HeadingHeadline2">
                Lleva tu negocio al próximo nivel con nuestros prónosticos
              </span>
              <span className="home-text14">
                ¿Qué es lo que ofrecemos?
              </span>
            </div>
            <div className="home-frame4">
              <div className="home-membership-organizatios">
                <div className="home-member">
                  <div className="home-container2">
                    <div className="home-icon">
                      <svg
                        viewBox="0 0 1170.2857142857142 1024"
                        className="home-icon01"
                      >
                        <path d="M365.714 512v292.571h-146.286v-292.571h146.286zM585.143 219.429v585.143h-146.286v-585.143h146.286zM1170.286 877.714v73.143h-1170.286v-877.714h73.143v804.571h1097.143zM804.571 365.714v438.857h-146.286v-438.857h146.286zM1024 146.286v658.286h-146.286v-658.286h146.286z"></path>
                      </svg>
                    </div>
                  </div>
                  <span className="home-text15 HeadingHeadline3">
                    Prónosticos de calidad
                  </span>
                </div>
                <div className="home-frame3">
                  <span className="home-text16">
                    Nuestra tecnología de última generación garantiza
                    pronósticos precisos para una toma de decisiones confiable.
                  </span>
                </div>
              </div>
              <div className="home-national-associations">
                <div className="home-member1">
                  <div className="home-icon03">
                    <svg viewBox="0 0 1024 1024" className="home-icon04">
                      <path d="M864 704c-45.16 0-85.92 18.738-115.012 48.83l-431.004-215.502c1.314-8.252 2.016-16.706 2.016-25.328s-0.702-17.076-2.016-25.326l431.004-215.502c29.092 30.090 69.852 48.828 115.012 48.828 88.366 0 160-71.634 160-160s-71.634-160-160-160-160 71.634-160 160c0 8.622 0.704 17.076 2.016 25.326l-431.004 215.504c-29.092-30.090-69.852-48.83-115.012-48.83-88.366 0-160 71.636-160 160 0 88.368 71.634 160 160 160 45.16 0 85.92-18.738 115.012-48.828l431.004 215.502c-1.312 8.25-2.016 16.704-2.016 25.326 0 88.368 71.634 160 160 160s160-71.632 160-160c0-88.364-71.634-160-160-160z"></path>
                    </svg>
                  </div>
                  <span className="home-text17 HeadingHeadline3">
                    Multiples modelos de forecast
                  </span>
                </div>
                <div className="home-frame31">
                  <span className="home-text18">
                    Ofrecemos modelos de series temporales, machine learning y
                    variables exógenas para que explores todas tus opciones
                  </span>
                </div>
              </div>
              <div className="home-national-associations1">
                <div className="home-member2">
                  <div className="home-icon06">
                    <svg viewBox="0 0 1024 1024" className="home-icon07">
                      <path d="M448 576v-448c-247.424 0-448 200.576-448 448s200.576 448 448 448 448-200.576 448-448c0-72.034-17.028-140.084-47.236-200.382l-400.764 200.382zM912.764 247.618c-73.552-146.816-225.374-247.618-400.764-247.618v448l400.764-200.382z"></path>
                    </svg>
                  </div>
                  <span className="home-text19 HeadingHeadline3">
                    Gráficos y reportes
                  </span>
                </div>
                <div className="home-frame32">
                  <span className="home-text20">
                    Genera un analisis profundo de las predicciones con nuestros
                    multiples graficos y reportes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </animate-on-reveal>
      </div>
      <animate-on-reveal
        animation="fadeIn"
        duration="600ms"
        delay="0s"
        direction="normal"
        easing="ease"
        iteration="1"
      >
        <div data-thq-animate-on-reveal="true" className="home-unlock">
          <div className="home-unlock1">
            <div className="home-frame35">
              <div className="home-mobileloginrafiki">
                <div className="home-backgroundcomplete"></div>
                <div className="home-backgroundsimple"></div>
                <div className="home-shadow">
                  <img
                    src="/external/vector2111-129d.svg"
                    alt="Vector2111"
                    className="home-vector"
                  />
                </div>
                <div className="home-character2">
                  <img
                    src="/external/vector2111-pbmn.svg"
                    alt="Vector2111"
                    className="home-vector001"
                  />
                  <img
                    src="/external/vector2111-yjha.svg"
                    alt="Vector2111"
                    className="home-vector002"
                  />
                  <img
                    src="/external/vector2111-7ga.svg"
                    alt="Vector2111"
                    className="home-vector003"
                  />
                  <img
                    src="/external/vector2111-qjuh.svg"
                    alt="Vector2111"
                    className="home-vector004"
                  />
                  <img
                    src="/external/vector2111-x7r.svg"
                    alt="Vector2111"
                    className="home-vector005"
                  />
                  <img
                    src="/external/vector2111-uky3.svg"
                    alt="Vector2111"
                    className="home-vector006"
                  />
                  <img
                    src="/external/vector2111-dg8g.svg"
                    alt="Vector2111"
                    className="home-vector007"
                  />
                  <img
                    src="/external/vector2111-eyxk.svg"
                    alt="Vector2111"
                    className="home-vector008"
                  />
                  <img
                    src="/external/vector2111-qswg.svg"
                    alt="Vector2111"
                    className="home-vector009"
                  />
                  <img
                    src="/external/vector2111-b9i.svg"
                    alt="Vector2111"
                    className="home-vector010"
                  />
                  <img
                    src="/external/vector2111-ngg9.svg"
                    alt="Vector2111"
                    className="home-vector011"
                  />
                  <img
                    src="/external/vector2111-8yp.svg"
                    alt="Vector2111"
                    className="home-vector012"
                  />
                  <img
                    src="/external/vector2111-4xq.svg"
                    alt="Vector2111"
                    className="home-vector013"
                  />
                  <img
                    src="/external/vector2111-gyam.svg"
                    alt="Vector2111"
                    className="home-vector014"
                  />
                  <img
                    src="/external/vector2111-p01.svg"
                    alt="Vector2111"
                    className="home-vector015"
                  />
                  <img
                    src="/external/vector2111-mmi4.svg"
                    alt="Vector2111"
                    className="home-vector016"
                  />
                  <img
                    src="/external/vector2111-xxar.svg"
                    alt="Vector2111"
                    className="home-vector017"
                  />
                  <img
                    src="/external/vector2111-g39x.svg"
                    alt="Vector2111"
                    className="home-vector018"
                  />
                  <img
                    src="/external/vector2111-redd.svg"
                    alt="Vector2111"
                    className="home-vector019"
                  />
                  <img
                    src="/external/vector2111-x2po.svg"
                    alt="Vector2111"
                    className="home-vector020"
                  />
                  <img
                    src="/external/vector2111-7y9.svg"
                    alt="Vector2111"
                    className="home-vector021"
                  />
                  <img
                    src="/external/vector2111-w6ha.svg"
                    alt="Vector2111"
                    className="home-vector022"
                  />
                  <img
                    src="/external/vector2111-fr5.svg"
                    alt="Vector2111"
                    className="home-vector023"
                  />
                  <img
                    src="/external/vector2111-qiwg.svg"
                    alt="Vector2111"
                    className="home-vector024"
                  />
                  <img
                    src="/external/vector2111-x9s.svg"
                    alt="Vector2111"
                    className="home-vector025"
                  />
                  <img
                    src="/external/vector2111-r1wp.svg"
                    alt="Vector2111"
                    className="home-vector026"
                  />
                  <img
                    src="/external/vector2111-9b8b.svg"
                    alt="Vector2111"
                    className="home-vector027"
                  />
                  <img
                    src="/external/vector2111-kyxc.svg"
                    alt="Vector2111"
                    className="home-vector028"
                  />
                  <img
                    src="/external/vector2111-wlu.svg"
                    alt="Vector2111"
                    className="home-vector029"
                  />
                  <img
                    src="/external/vector2111-ew4b.svg"
                    alt="Vector2111"
                    className="home-vector030"
                  />
                  <img
                    src="/external/vector2111-hrri.svg"
                    alt="Vector2111"
                    className="home-vector031"
                  />
                  <img
                    src="/external/vector2111-6rp8.svg"
                    alt="Vector2111"
                    className="home-vector032"
                  />
                  <img
                    src="/external/vector2111-cuvf.svg"
                    alt="Vector2111"
                    className="home-vector033"
                  />
                  <img
                    src="/external/vector2111-8kh.svg"
                    alt="Vector2111"
                    className="home-vector034"
                  />
                  <img
                    src="/external/vector2111-g79e.svg"
                    alt="Vector2111"
                    className="home-vector035"
                  />
                  <img
                    src="/external/vector2111-wprl.svg"
                    alt="Vector2111"
                    className="home-vector036"
                  />
                  <img
                    src="/external/vector2111-55ss.svg"
                    alt="Vector2111"
                    className="home-vector037"
                  />
                  <img
                    src="/external/vector2111-2jqa.svg"
                    alt="Vector2111"
                    className="home-vector038"
                  />
                  <img
                    src="/external/vector2111-s88q.svg"
                    alt="Vector2111"
                    className="home-vector039"
                  />
                  <img
                    src="/external/vector2111-1o2x.svg"
                    alt="Vector2111"
                    className="home-vector040"
                  />
                  <img
                    src="/external/vector2111-9y8m.svg"
                    alt="Vector2111"
                    className="home-vector041"
                  />
                  <img
                    src="/external/vector2111-3wwz.svg"
                    alt="Vector2111"
                    className="home-vector042"
                  />
                  <img
                    src="/external/vector2111-drg.svg"
                    alt="Vector2111"
                    className="home-vector043"
                  />
                  <img
                    src="/external/vector2111-4sj.svg"
                    alt="Vector2111"
                    className="home-vector044"
                  />
                  <img
                    src="/external/vector2111-j4h.svg"
                    alt="Vector2111"
                    className="home-vector045"
                  />
                  <img
                    src="/external/vector2111-mvy.svg"
                    alt="Vector2111"
                    className="home-vector046"
                  />
                  <img
                    src="/external/vector2111-wern.svg"
                    alt="Vector2111"
                    className="home-vector047"
                  />
                  <img
                    src="/external/vector2111-snr.svg"
                    alt="Vector2111"
                    className="home-vector048"
                  />
                  <img
                    src="/external/vector2111-mos.svg"
                    alt="Vector2111"
                    className="home-vector049"
                  />
                  <img
                    src="/external/vector2111-u5ya.svg"
                    alt="Vector2111"
                    className="home-vector050"
                  />
                </div>
                <div className="home-screen">
                  <img
                    src="/external/vector2111-8cu.svg"
                    alt="Vector2111"
                    className="home-vector051"
                  />
                  <img
                    src="/external/vector2111-hyp9.svg"
                    alt="Vector2111"
                    className="home-vector052"
                  />
                  <img
                    src="/external/vector2111-va69.svg"
                    alt="Vector2111"
                    className="home-vector053"
                  />
                  <img
                    src="/external/vector2111-cmif.svg"
                    alt="Vector2111"
                    className="home-vector054"
                  />
                  <img
                    src="/external/vector2111-bzfg.svg"
                    alt="Vector2111"
                    className="home-vector055"
                  />
                  <img
                    src="/external/vector2111-o0db.svg"
                    alt="Vector2111"
                    className="home-vector056"
                  />
                  <img
                    src="/external/vector2111-1ihq.svg"
                    alt="Vector2111"
                    className="home-vector057"
                  />
                  <img
                    src="/external/vector2111-xi4h.svg"
                    alt="Vector2111"
                    className="home-vector058"
                  />
                  <img
                    src="/external/vector2111-rxr.svg"
                    alt="Vector2111"
                    className="home-vector059"
                  />
                  <img
                    src="/external/vector2111-u3dv.svg"
                    alt="Vector2111"
                    className="home-vector060"
                  />
                  <img
                    src="/external/vector2111-dbpa.svg"
                    alt="Vector2111"
                    className="home-vector061"
                  />
                  <img
                    src="/external/vector2111-2q0h.svg"
                    alt="Vector2111"
                    className="home-vector062"
                  />
                  <img
                    src="/external/vector2111-ufem.svg"
                    alt="Vector2111"
                    className="home-vector063"
                  />
                  <img
                    src="/external/vector2111-xran.svg"
                    alt="Vector2111"
                    className="home-vector064"
                  />
                  <img
                    src="/external/vector2111-1bma.svg"
                    alt="Vector2111"
                    className="home-vector065"
                  />
                  <img
                    src="/external/vector2111-8k6o.svg"
                    alt="Vector2111"
                    className="home-vector066"
                  />
                  <img
                    src="/external/vector2111-9vc2.svg"
                    alt="Vector2111"
                    className="home-vector067"
                  />
                  <img
                    src="/external/vector2111-buyr.svg"
                    alt="Vector2111"
                    className="home-vector068"
                  />
                  <img
                    src="/external/vector2111-lwql.svg"
                    alt="Vector2111"
                    className="home-vector069"
                  />
                  <img
                    src="/external/vector2111-n1nr.svg"
                    alt="Vector2111"
                    className="home-vector070"
                  />
                  <img
                    src="/external/vector2111-5ql9.svg"
                    alt="Vector2111"
                    className="home-vector071"
                  />
                  <img
                    src="/external/vector2111-bfn6.svg"
                    alt="Vector2111"
                    className="home-vector072"
                  />
                  <img
                    src="/external/vector2111-b9l.svg"
                    alt="Vector2111"
                    className="home-vector073"
                  />
                  <img
                    src="/external/vector2111-t776.svg"
                    alt="Vector2111"
                    className="home-vector074"
                  />
                  <img
                    src="/external/vector2111-tlj2.svg"
                    alt="Vector2111"
                    className="home-vector075"
                  />
                </div>
                <div className="home-character1">
                  <img
                    src="/external/vector2111-pfjm.svg"
                    alt="Vector2111"
                    className="home-vector076"
                  />
                  <img
                    src="/external/vector2111-8mqr.svg"
                    alt="Vector2111"
                    className="home-vector077"
                  />
                  <img
                    src="/external/vector2111-cc2.svg"
                    alt="Vector2111"
                    className="home-vector078"
                  />
                  <img
                    src="/external/vector2111-30htl.svg"
                    alt="Vector2111"
                    className="home-vector079"
                  />
                  <img
                    src="/external/vector2111-w91g.svg"
                    alt="Vector2111"
                    className="home-vector080"
                  />
                  <img
                    src="/external/vector2111-r5tp.svg"
                    alt="Vector2111"
                    className="home-vector081"
                  />
                  <img
                    src="/external/vector2111-kx2t.svg"
                    alt="Vector2111"
                    className="home-vector082"
                  />
                  <img
                    src="/external/vector2111-6dmc.svg"
                    alt="Vector2111"
                    className="home-vector083"
                  />
                  <img
                    src="/external/vector2111-h1sp.svg"
                    alt="Vector2111"
                    className="home-vector084"
                  />
                  <img
                    src="/external/vector2111-7tik.svg"
                    alt="Vector2111"
                    className="home-vector085"
                  />
                  <img
                    src="/external/vector2111-85n6.svg"
                    alt="Vector2111"
                    className="home-vector086"
                  />
                  <img
                    src="/external/vector2111-6ysd.svg"
                    alt="Vector2111"
                    className="home-vector087"
                  />
                  <img
                    src="/external/vector2111-7hhj.svg"
                    alt="Vector2111"
                    className="home-vector088"
                  />
                  <img
                    src="/external/vector2111-o6pl.svg"
                    alt="Vector2111"
                    className="home-vector089"
                  />
                  <img
                    src="/external/vector2111-om0u.svg"
                    alt="Vector2111"
                    className="home-vector090"
                  />
                  <img
                    src="/external/vector2111-7p27.svg"
                    alt="Vector2111"
                    className="home-vector091"
                  />
                  <img
                    src="/external/vector2111-181k.svg"
                    alt="Vector2111"
                    className="home-vector092"
                  />
                  <img
                    src="/external/vector2111-qdwe.svg"
                    alt="Vector2111"
                    className="home-vector093"
                  />
                  <img
                    src="/external/vector2111-e8se.svg"
                    alt="Vector2111"
                    className="home-vector094"
                  />
                  <img
                    src="/external/vector2111-kew.svg"
                    alt="Vector2111"
                    className="home-vector095"
                  />
                  <img
                    src="/external/vector2111-5edk.svg"
                    alt="Vector2111"
                    className="home-vector096"
                  />
                  <img
                    src="/external/vector2111-7o4d.svg"
                    alt="Vector2111"
                    className="home-vector097"
                  />
                  <img
                    src="/external/vector2111-1v0q.svg"
                    alt="Vector2111"
                    className="home-vector098"
                  />
                  <img
                    src="/external/vector2111-0dj.svg"
                    alt="Vector2111"
                    className="home-vector099"
                  />
                  <img
                    src="/external/vector2111-abe3.svg"
                    alt="Vector2111"
                    className="home-vector100"
                  />
                  <img
                    src="/external/vector2111-6y79.svg"
                    alt="Vector2111"
                    className="home-vector101"
                  />
                  <img
                    src="/external/vector2111-47c.svg"
                    alt="Vector2111"
                    className="home-vector102"
                  />
                  <img
                    src="/external/vector2111-xmv.svg"
                    alt="Vector2111"
                    className="home-vector103"
                  />
                  <img
                    src="/external/vector2111-dwze.svg"
                    alt="Vector2111"
                    className="home-vector104"
                  />
                  <img
                    src="/external/vector2111-19iv.svg"
                    alt="Vector2111"
                    className="home-vector105"
                  />
                  <img
                    src="/external/vector2111-yaxd.svg"
                    alt="Vector2111"
                    className="home-vector106"
                  />
                  <img
                    src="/external/vector2111-3ej.svg"
                    alt="Vector2111"
                    className="home-vector107"
                  />
                  <img
                    src="/external/vector2111-c4nt.svg"
                    alt="Vector2111"
                    className="home-vector108"
                  />
                  <img
                    src="/external/vector2111-0fwd.svg"
                    alt="Vector2111"
                    className="home-vector109"
                  />
                  <img
                    src="/external/vector2111-qgcr.svg"
                    alt="Vector2111"
                    className="home-vector110"
                  />
                  <img
                    src="/external/vector2111-ottu.svg"
                    alt="Vector2111"
                    className="home-vector111"
                  />
                  <img
                    src="/external/vector2111-9uxq.svg"
                    alt="Vector2111"
                    className="home-vector112"
                  />
                  <img
                    src="/external/vector2111-ork.svg"
                    alt="Vector2111"
                    className="home-vector113"
                  />
                  <img
                    src="/external/vector2111-q80ok.svg"
                    alt="Vector2111"
                    className="home-vector114"
                  />
                  <img
                    src="/external/vector2111-wq1.svg"
                    alt="Vector2111"
                    className="home-vector115"
                  />
                  <img
                    src="/external/vector2111-9qfb.svg"
                    alt="Vector2111"
                    className="home-vector116"
                  />
                  <img
                    src="/external/vector2111-ajef.svg"
                    alt="Vector2111"
                    className="home-vector117"
                  />
                  <img
                    src="/external/vector2111-jnoa.svg"
                    alt="Vector2111"
                    className="home-vector118"
                  />
                  <img
                    src="/external/vector2111-feeb.svg"
                    alt="Vector2111"
                    className="home-vector119"
                  />
                  <img
                    src="/external/vector2111-rofm.svg"
                    alt="Vector2111"
                    className="home-vector120"
                  />
                  <img
                    src="/external/vector2111-lq7c.svg"
                    alt="Vector2111"
                    className="home-vector121"
                  />
                </div>
              </div>
            </div>
            <div className="home-frame6">
              <div className="home-frame5">
                <span className="home-text21">
                  SOLUCIONES SIMPLES PARA PROBLEMAS COMPLEJOS
                </span>
                <span className="home-text22">
                  Nuestra plataforma desarrollada para transformar datos en
                  decisiones inteligentes. Nuestro servicio de forecast utiliza
                  tecnología avanzada para prever el futuro, proporcionándote
                  información precisa y valiosa para impulsar el éxito de tu
                  negocio.
                </span>
              </div>
              <button className="home-button2">
                <span className="home-text23">
                  Quiero ser parte!
                </span>
              </button>
            </div>
          </div>
        </div>
      </animate-on-reveal>
      <div className="home-achievements">
        <div className="home-container3">
          <div className="home-section-heading">
            <div className="home-section-heading1">
              <span className="home-text24">
                Ayudamos negocios locales alcanzar soluciones eficientes
              </span>
            </div>
          </div>
          <div className="home-counts">
            <div className="home-row1">
              <div className="home-frame2">
                <svg
                  viewBox="0 0 1097.142857142857 1024"
                  className="home-icon09"
                >
                  <path d="M338.857 512c-59.429 1.714-113.143 27.429-151.429 73.143h-76.571c-57.143 0-110.857-27.429-110.857-90.857 0-46.286-1.714-201.714 70.857-201.714 12 0 71.429 48.571 148.571 48.571 26.286 0 51.429-4.571 76-13.143-1.714 12.571-2.857 25.143-2.857 37.714 0 52 16.571 103.429 46.286 146.286zM950.857 876c0 92.571-61.143 148-152.571 148h-499.429c-91.429 0-152.571-55.429-152.571-148 0-129.143 30.286-327.429 197.714-327.429 19.429 0 90.286 79.429 204.571 79.429s185.143-79.429 204.571-79.429c167.429 0 197.714 198.286 197.714 327.429zM365.714 146.286c0 80.571-65.714 146.286-146.286 146.286s-146.286-65.714-146.286-146.286 65.714-146.286 146.286-146.286 146.286 65.714 146.286 146.286zM768 365.714c0 121.143-98.286 219.429-219.429 219.429s-219.429-98.286-219.429-219.429 98.286-219.429 219.429-219.429 219.429 98.286 219.429 219.429zM1097.143 494.286c0 63.429-53.714 90.857-110.857 90.857h-76.571c-38.286-45.714-92-71.429-151.429-73.143 29.714-42.857 46.286-94.286 46.286-146.286 0-12.571-1.143-25.143-2.857-37.714 24.571 8.571 49.714 13.143 76 13.143 77.143 0 136.571-48.571 148.571-48.571 72.571 0 70.857 155.429 70.857 201.714zM1024 146.286c0 80.571-65.714 146.286-146.286 146.286s-146.286-65.714-146.286-146.286 65.714-146.286 146.286-146.286 146.286 65.714 146.286 146.286z"></path>
                </svg>
                <div className="home-details">
                  <span className="home-text25 HeadingHeadline3">+50</span>
                  <span className="home-text26 BodyRegularBody2">
                    Clientes en linea
                  </span>
                </div>
              </div>
              <div className="home-frame11">
                <svg
                  viewBox="0 0 1170.2857142857142 1024"
                  className="home-icon11"
                >
                  <path d="M365.714 512v292.571h-146.286v-292.571h146.286zM585.143 219.429v585.143h-146.286v-585.143h146.286zM1170.286 877.714v73.143h-1170.286v-877.714h73.143v804.571h1097.143zM804.571 365.714v438.857h-146.286v-438.857h146.286zM1024 146.286v658.286h-146.286v-658.286h146.286z"></path>
                </svg>
                <div className="home-details1">
                  <span className="home-text27 HeadingHeadline3">+10</span>
                  <span className="home-text28 BodyRegularBody2">
                    Plantillas de datos
                  </span>
                </div>
              </div>
            </div>
            <div className="home-row2">
              <div className="home-frame33">
                <svg
                  viewBox="0 0 1170.2857142857142 1024"
                  className="home-icon13"
                >
                  <path d="M1170.286 877.714v73.143h-1170.286v-877.714h73.143v804.571h1097.143zM1097.143 164.571v248.571c0 16-19.429 24.571-31.429 12.571l-69.143-69.143-361.714 361.714c-7.429 7.429-18.857 7.429-26.286 0l-133.143-133.143-237.714 237.714-109.714-109.714 334.286-334.286c7.429-7.429 18.857-7.429 26.286 0l133.143 133.143 265.143-265.143-69.143-69.143c-12-12-3.429-31.429 12.571-31.429h248.571c10.286 0 18.286 8 18.286 18.286z"></path>
                </svg>
                <div className="home-details2">
                  <span className="home-text29 HeadingHeadline3">+1500</span>
                  <span className="home-text30">Prónosticos mensuales</span>
                </div>
              </div>
              <div className="home-frame41">
                <div className="home-details3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="home-calender">
        <div className="home-unlock2">
          <div className="home-frame61">
            <div className="home-frame51">
              <span className="home-text31 HeadingHeadline2">
                ¿Como usar nuestra plataforma para sacarle el mayor provecho?
              </span>
              <span className="home-text32">
                El flujo de nuestro sistema es muy simple. Descargas las
                plantillas de datos historicos, colocas los productos donde
                podras categorizarlos por familia, categoria, clientes,
                vendedores SKU, llenas de datos esta planilla de excel y la
                subis a la plataforma. Una vez cargado los datos historicos,
                escoges los modelos de prediccion, lo parametrizas y se genera
                tu forecast! 
              </span>
            </div>
            <button className="home-button3">
              <span className="home-text33">
                Quiero saber más!
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="home-footer">
        <div className="home-frame16">
          <span className="home-text34">
            Si quieres formar parte de dta-forecast, contactanos!
          </span>
          <button className="home-button4">
            <span className="home-text35">Contactar</span>
          </button>
        </div>
        <div className="home-footer-big4">
          <div className="home-company-info">
            <img
              src={logo}
              alt="image"
              className="home-image1"
            />
            <div className="home-copyright">
              <span className="home-text36 BodyRegularBody3">
                Copyright © 2024 Dta-Logistica.
              </span>
              <span className="home-text37">Todos los derechos reservados</span>
            </div>
          </div>
          <div className="home-links">
            <div className="home-col1">
              <span className="home-text38 HeadingHeadline4">DTA-FORECAST</span>
              <div className="home-list-items">
                <Link to="https://www.dtalogistica.com/">
                  <span className="home-text39 BodyRegularBody3">
                    Sobre nosotros
                  </span>
                </Link>
                <span className="home-text40 BodyRegularBody3">
                  Contactanos
                </span>
                <span className="home-text41 BodyRegularBody3">Precios</span>
                <span className="home-text42 BodyRegularBody3">
                  Manual dta-forecast
                </span>
              </div>
            </div>
            <div className="home-col11">
              <span className="home-text43">REDES SOCIALES</span>
              <div className="home-list-items1">
                <Link to='https://www.linkedin.com/company/tfa-logistica/about/'>
                  <span className="home-text44 BodyRegularBody2">LinkedIn</span>
                </Link>
                <Link to="https://www.dtalogistica.com/">
                 <span className="home-text45 BodyRegularBody3">Website</span>
                </Link>
                <span className="home-text46 BodyRegularBody3">Mail</span>
                <span className="home-text47 BodyRegularBody3">WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
