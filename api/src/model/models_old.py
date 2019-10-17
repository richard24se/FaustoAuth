# coding: utf-8
from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
metadata = Base.metadata


class BallotPaperBanco(Base):
    __tablename__ = 'BallotPaper_Banco'

    id_banco = Column(String(10), primary_key=True)
    Descripcion = Column(String(200))
    Ruc = Column(String(20))
    Direccion = Column(String(100))


class BallotPaperDepartamento(Base):
    __tablename__ = 'BallotPaper_Departamento'

    id_departamento = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))


class BallotPaperEstado(Base):
    __tablename__ = 'BallotPaper_Estado'

    id_estado = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    Tipo = Column(String(10))
    DescripcionTipo = Column(String(100))


class BallotPaperLevantamiento(Base):
    __tablename__ = 'BallotPaper_Levantamiento'

    id_levantamiento = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    Fec_emision_oficio = Column(Date)
    Fec_notificacion_oficio = Column(Date)
    id_banco = Column(String(10))
    Observaciones = Column(String(100), nullable=False)


class BallotPaperMesaParte(Base):
    __tablename__ = 'BallotPaper_MesaPartes'

    id_mesaPartes = Column(String(10), primary_key=True)
    Nro_expedienteTramite = Column(String(50))
    Fec_presentada = Column(Date)
    Sumilla_coactivo = Column(String(100))
    Presenta_recurso = Column(String(100))
    Domicilio_procesal = Column(String(100))
    id_departamento = Column(String(10))
    Folios = Column(String(100))


class BallotPaperMunicipalidad(Base):
    __tablename__ = 'BallotPaper_Municipalidad'

    id_municipalidad = Column(String(10), primary_key=True)
    Descripcion = Column(String(200))


class BallotPaperRetencionCuenta(Base):
    __tablename__ = 'BallotPaper_Retencion_cuenta'

    id_retencion_cuenta = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    id_detalle_retencion = Column(String(10))


class BallotPaperTipoResolucion(Base):
    __tablename__ = 'BallotPaper_TipoResolucion'

    id_tipo = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    Observaciones = Column(String(200), nullable=False)


class BallotPaperUsuario(Base):
    __tablename__ = 'BallotPaper_Usuario'

    id_usuario = Column(String(10), primary_key=True)
    Descripcion = Column(String(10))
    Nombres = Column(String(100))
    ApellidoPaterno = Column(String(100))
    ApellidoMaterno = Column(String(100))
    correo = Column(String(100))
    Sexo = Column(Boolean)
    id_estado = Column(String(10))


class BallotPaperPapeleta(Base):
    __tablename__ = 'BallotPaper_Papeleta'

    id_papeleta = Column(Integer, primary_key=True)
    id_municipalidad = Column(String(10))
    Nro_papeleta = Column(String(10))
    Fec_captura = Column(Date)
    Fec_notificacion = Column(Date, nullable=False)
    Placa = Column(String(10))
    Propietario = Column(String(200))
    Documento = Column(String(15), nullable=False)
    Ruc = Column(String(15), nullable=False)
    Importe = Column(Float)
    Direccion = Column(String(200))
    id_distrito = Column(String(10))
    id_provincia = Column(String(10))
    id_departamento = Column(String(10))
    id_municipalidad_BallotPaper_Municipalidad = Column(ForeignKey('BallotPaper_Municipalidad.id_municipalidad', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Municipalidad = relationship('BallotPaperMunicipalidad')


class BallotPaperProvincia(Base):
    __tablename__ = 'BallotPaper_Provincia'

    id_provincia = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    id_departamento = Column(String(10))
    id_departamento_BallotPaper_Departamento = Column(ForeignKey('BallotPaper_Departamento.id_departamento', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Departamento = relationship('BallotPaperDepartamento')


class BallotPaperRespuestaBanco(Base):
    __tablename__ = 'BallotPaper_Respuesta_Banco'

    id_respuesta_banco = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    Fec_recepcion = Column(Date)
    Fec_envio_respuesta = Column(Date)
    importe = Column(Float)
    Nro_ingreso = Column(String(100), nullable=False)
    id_retencion_cuenta_BallotPaper_Retencion_cuenta = Column(ForeignKey('BallotPaper_Retencion_cuenta.id_retencion_cuenta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Retencion_cuenta = relationship('BallotPaperRetencionCuenta')


class BallotPaperRetencionBanco(Base):
    __tablename__ = 'BallotPaper_RetencionBanco'

    id_retencion_banco = Column(String(10), primary_key=True)
    Descripcion = Column(String(100), nullable=False)
    Fec_emision_oficio = Column(Date)
    Fec_notificacion_oficio = Column(Date)
    id_banco = Column(String(10))
    id_retencion_cuenta_BallotPaper_Retencion_cuenta = Column(ForeignKey('BallotPaper_Retencion_cuenta.id_retencion_cuenta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Retencion_cuenta = relationship('BallotPaperRetencionCuenta')


class BallotPaperDetalleRptaBanco(Base):
    __tablename__ = 'BallotPaper_DetalleRptaBanco'

    id_detalleRptaBanco = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    id_respuesta_banco_BallotPaper_Respuesta_Banco = Column(ForeignKey('BallotPaper_Respuesta_Banco.id_respuesta_banco', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Respuesta_Banco = relationship('BallotPaperRespuestaBanco')


class BallotPaperDistrito(Base):
    __tablename__ = 'BallotPaper_Distrito'

    id_distrito = Column(String(10), primary_key=True)
    Descripcion = Column(String(10))
    id_provincia = Column(String(10))
    id_departamento = Column(String(10))
    id_provincia_BallotPaper_Provincia = Column(ForeignKey('BallotPaper_Provincia.id_provincia', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))

    BallotPaper_Provincia = relationship('BallotPaperProvincia')


class BallotPaperResolucion(Base):
    __tablename__ = 'BallotPaper_Resolucion'

    id_resolucion = Column(String(10), primary_key=True)
    Nro_resolucion = Column(String(10))
    id_tipo = Column(String(10))
    Anio = Column(String(10), nullable=False)
    Siglica = Column(String(20), nullable=False)
    Fec_emision_resolucion = Column(Date, nullable=False)
    Fec_notificacion_resolucion = Column(Date, nullable=False)
    id_estado = Column(String(10))
    Observaciones = Column(String(200), nullable=False)
    Nueva_direccion = Column(String(200), nullable=False)
    Pago_oportuno = Column(Float, nullable=False)
    id_banco = Column(String(10), nullable=False)
    id_tipo_BallotPaper_TipoResolucion = Column(ForeignKey('BallotPaper_TipoResolucion.id_tipo', ondelete='SET NULL', onupdate='CASCADE', match='FULL'))
    id_papeleta_BallotPaper_Papeleta = Column(ForeignKey('BallotPaper_Papeleta.id_papeleta', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_Papeleta = relationship('BallotPaperPapeleta', uselist=False)
    BallotPaper_TipoResolucion = relationship('BallotPaperTipoResolucion')


class BallotPaperRC1(Base):
    __tablename__ = 'BallotPaper_RC1'

    id_rc1 = Column(String(10), primary_key=True)
    nro_rc1 = Column(String(100))
    Fec_emision_RC1 = Column(Date)
    Fec_notificacion_RC1 = Column(Date)
    id_estado = Column(String(10))
    Nro_informe = Column(String(50), nullable=False)
    Fec_informe = Column(Date, nullable=False)
    Nro_constancia_exigibilidad = Column(String(50), nullable=False)
    Fec_constancia_exigibilidad = Column(Date, nullable=False)
    Costas_gastos_RC1 = Column(Float, nullable=False)
    Costas_RC2 = Column(Float, nullable=False)
    Gastos_RC2 = Column(Float, nullable=False)
    Costas_Retencion = Column(Float, nullable=False)
    Total_pagar_rc2 = Column(Float, nullable=False)
    RC1_Cancelacion_Monto = Column(Float, nullable=False)
    Fec_pago = Column(Date, nullable=False)
    id_banco = Column(String(10), nullable=False)
    id_resolucion_BallotPaper_Resolucion = Column(ForeignKey('BallotPaper_Resolucion.id_resolucion', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_Resolucion = relationship('BallotPaperResolucion', uselist=False)


class BallotPaperRC2(Base):
    __tablename__ = 'BallotPaper_RC2'

    id_rc2 = Column(String, primary_key=True)
    nro_rc2 = Column(String(100), nullable=False)
    Descripcion_rc2 = Column(String(100), nullable=False)
    Fec_emision_rc2 = Column(Date, nullable=False)
    Fec_notificacion_rc2 = Column(Date, nullable=False)
    mto_pagado = Column(Float, nullable=False)
    Fec_pago = Column(Date, nullable=False)
    id_banco = Column(String(10), nullable=False)
    id_rc1_BallotPaper_RC1 = Column(ForeignKey('BallotPaper_RC1.id_rc1', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_RC1 = relationship('BallotPaperRC1', uselist=False)


class BallotPaperRC3(Base):
    __tablename__ = 'BallotPaper_RC3'

    id_rc3 = Column(String(10), primary_key=True)
    Nro_rc3 = Column(String(50))
    Descripcion_rc3 = Column(String(100))
    Fec_emision_rc3 = Column(Date)
    Fec_notificacion_rc3 = Column(Date)
    Nro_oficio_giro_cheque = Column(String(50))
    Fec_emision_oficio_giro = Column(Date)
    Fec_notificacion_oficio_giro = Column(Date)
    Nro_cheque = Column(String(50))
    Fec_cheque = Column(Date)
    id_banco = Column(String(10))
    Mto_cheque = Column(Float)
    Nro_formato = Column(String(50))
    Fec_recojo_cheque = Column(Date)
    Persona_recojo_cheque = Column(String(100), nullable=False)
    id_rc2_BallotPaper_RC2 = Column(ForeignKey('BallotPaper_RC2.id_rc2', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_RC2 = relationship('BallotPaperRC2', uselist=False)


class BallotPaperRC4(Base):
    __tablename__ = 'BallotPaper_RC4'

    id_rc4 = Column(String(10), primary_key=True)
    Descripcion = Column(String(100))
    Fec_emision_rc4 = Column(Date)
    Fec_notificacion_rc4 = Column(Date)
    Observaciones = Column(String(100), nullable=False)
    id_rc3_BallotPaper_RC3 = Column(ForeignKey('BallotPaper_RC3.id_rc3', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_RC3 = relationship('BallotPaperRC3', uselist=False)


class BallotPaperRC5(Base):
    __tablename__ = 'BallotPaper_RC5'

    id_rc5 = Column(String(10), primary_key=True)
    Nro_rc5 = Column(String(50))
    Descripcion_RC5 = Column(String(100))
    Fec_emision_rc5 = Column(Date)
    Fec_notificacion_rc5 = Column(Date)
    Notificacion_mail = Column(String(100), nullable=False)
    Fec_envio_notificacion_mail = Column(Date, nullable=False)
    Usuario_nofitica_mail = Column(String(100), nullable=False)
    id_estado = Column(String(10))
    id_rc4_BallotPaper_RC4 = Column(ForeignKey('BallotPaper_RC4.id_rc4', ondelete='SET NULL', onupdate='CASCADE', match='FULL'), unique=True)

    BallotPaper_RC4 = relationship('BallotPaperRC4', uselist=False)