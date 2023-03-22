import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import moment from "moment";
import "./App.css";
import { BsFillTrashFill } from "react-icons/bs";
import { IoPersonAddSharp } from "react-icons/io5";

function App() {
  const inputRef = useRef();
  const [shouldFocus, setShouldFocus] = useState(true);

  const [professores, setProfessores] = useState([]);

  const [choosenProf, setChoosenProf] = useState(
    professores.length > 0 ? [professores[0].name] : null
  );

  const handleChangeProfessor = (idProfessor, key, value) => {
    const newArrProfessoresAlterado = professores.map((prof) =>
      prof.id === idProfessor ? { ...prof, [key]: value } : prof
    );

    const newChoosenProf =
      choosenProf.length === professores.length
        ? newArrProfessoresAlterado.map((e) => e.name)
        : newArrProfessoresAlterado.find((p) => p.id === idProfessor);
    setChoosenProf(
      newChoosenProf.length ? newChoosenProf : [newChoosenProf.name]
    );
    setProfessores(newArrProfessoresAlterado);
  };

  const handleDeleteProfessor = (idProfessor) => {
    const confirmBtn = confirm("Deletar professor?");
    if (confirmBtn) {
      const newArrProfessoresAlterado = professores.filter(
        (prof) => prof.id !== idProfessor
      );
      setProfessores(newArrProfessoresAlterado);
      if (newArrProfessoresAlterado.length > 0) {
        setChoosenProf(newArrProfessoresAlterado[0].name);
      }
    }
  };

  const handleChangeAluno = (idProfessor, idAluno, key, value) => {
    const profEscolhido = professores.find((prof) => prof.id === idProfessor);
    const newArrAlunoAlterado = profEscolhido.alunos.map((aluno) =>
      aluno.id === idAluno ? { ...aluno, [key]: value } : aluno
    );
    profEscolhido.alunos = newArrAlunoAlterado;

    const newArrProfessoresAlterado = professores.map((prof) =>
      prof.id === idProfessor ? profEscolhido : prof
    );
    setProfessores(newArrProfessoresAlterado);
  };

  const handleAddAluno = (idProfessor) => {
    const profEscolhido = professores.find((prof) => prof.id === idProfessor);

    profEscolhido.alunos = [
      ...profEscolhido.alunos,
      {
        id: Math.random(),
        nome: "",
        vencimento: null,
        valor: 0,
        ativo: true,
      },
    ];

    const newArrProfessoresAlterado = professores.map((prof) =>
      prof.id === idProfessor ? profEscolhido : prof
    );
    setProfessores(newArrProfessoresAlterado);
  };

  useEffect(() => {
    if (inputRef && shouldFocus && professores.length > 0) {
      inputRef.current.focus();
      setShouldFocus(false);
    }
  }, [inputRef, shouldFocus]);

  const valorTotalBruto = professores.reduce(
    (prev, curr) =>
      prev + curr.alunos.reduce((p, c) => (c.ativo ? p + c.valor : p), 0),
    0
  );

  const valorTotalComissao = professores.reduce(
    (prev, curr) =>
      prev +
      curr.alunos.reduce((p, c) => (c.ativo ? p + c.valor : p), 0) *
        (curr.percentual / 100),
    0
  );

  const handleAddProfessor = () => {
    const newProf = {
      id: Math.random(),
      name: "",
      alunos: [],
      percentual: 25,
    };
    setProfessores([...professores, newProf]);
    setChoosenProf([""]);
  };

  const handleSave = () => {
    const fileData = JSON.stringify(professores);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dia = moment.format(new Date(), "dd-mm-yyyy");
    link.download = "user-info.json";
    link.href = url;
    link.click();
  };

  const [file, setFile] = useState(null);

  const handleUploadFile = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setFile(e.target.result);
    };
  };

  useEffect(() => {
    if (file) {
      setProfessores(JSON.parse(file));
    }
  }, [file]);

  return (
    <>
      {professores.length > 0 && (
        <>
          <input type="file" onChange={(e) => handleUploadFile(e)} />
          <StyledButton onClick={handleSave}>Salvar</StyledButton>
          {
            <TotalValuesBox>
              <div>
                Valor total bruto: R${" "}
                {valorTotalBruto.toFixed(2).replace(".", ",")}
              </div>
              <div>
                Valor total líquido: R${" "}
                {(valorTotalBruto - valorTotalComissao)
                  .toFixed(2)
                  .replace(".", ",")}
              </div>
            </TotalValuesBox>
          }
          <div style={{ display: "flex" }}>
            <ProfSelectBox>
              <StyledButton
                onClick={(e) => setChoosenProf(professores.map((e) => e.name))}
              >
                Todos
              </StyledButton>
              {professores.map((prof) => (
                <div key={prof.id}>
                  <StyledButton onClick={(e) => setChoosenProf(prof.name)}>
                    {prof.name}
                  </StyledButton>
                </div>
              ))}
              <StyledButton
                onClick={handleAddProfessor}
                disabled={
                  professores.length > 0 &&
                  !professores[professores.length - 1].name
                }
              >
                <IoPersonAddSharp />
              </StyledButton>
            </ProfSelectBox>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginLeft: "2rem",
              }}
            >
              {professores.map((professor) => {
                if (choosenProf && choosenProf.includes(professor.name)) {
                  return (
                    <ContainerBox key={professor.id}>
                      <DeleteIcon>
                        <div
                          onClick={() => handleDeleteProfessor(professor.id)}
                        >
                          <BsFillTrashFill />
                        </div>
                      </DeleteIcon>
                      <Name>
                        Nome:
                        <input
                          placeholder="insira um nome"
                          style={{ marginLeft: "12px" }}
                          type="text"
                          value={professor.name}
                          onChange={(e) =>
                            handleChangeProfessor(
                              professor.id,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </Name>
                      <Name>
                        Percent:
                        <input
                          type="number"
                          value={professor.percentual}
                          onChange={(e) =>
                            handleChangeProfessor(
                              professor.id,
                              "percentual",
                              e.target.value
                            )
                          }
                        />
                      </Name>
                      <hr />
                      <br />
                      <AlunosContainer>
                        {professor.alunos.map((aluno) => (
                          <AlunosBox key={aluno.id}>
                            <input
                              type="checkbox"
                              checked={aluno.ativo}
                              onChange={(e) =>
                                handleChangeAluno(
                                  professor.id,
                                  aluno.id,
                                  "ativo",
                                  e.target.checked
                                )
                              }
                            />
                            <input
                              ref={
                                aluno.id ===
                                professor.alunos[professor.alunos.length - 1].id
                                  ? inputRef
                                  : null
                              }
                              type="text"
                              disabled={!aluno.ativo}
                              value={aluno.nome}
                              onChange={(e) =>
                                handleChangeAluno(
                                  professor.id,
                                  aluno.id,
                                  "nome",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              disabled={!aluno.ativo}
                              value={aluno.valor}
                              onChange={(e) =>
                                handleChangeAluno(
                                  professor.id,
                                  aluno.id,
                                  "valor",
                                  Number(e.target.value)
                                )
                              }
                            />
                            <input
                              type="date"
                              disabled={!aluno.ativo}
                              value={aluno.vencimento}
                              onChange={(e) => {
                                console.log(
                                  "t",
                                  moment(e.target.value).format("DD/MM/YYYY")
                                );

                                handleChangeAluno(
                                  professor.id,
                                  aluno.id,
                                  "vencimento",
                                  e.target.value
                                );
                              }}
                            />
                          </AlunosBox>
                        ))}
                      </AlunosContainer>
                      <ButtonBox>
                        <StyledButton
                          disabled={
                            professor.alunos.length > 0 &&
                            (!professor.alunos[professor.alunos.length - 1]
                              .nome ||
                              !professor.alunos[professor.alunos.length - 1]
                                .valor ||
                              !professor.alunos[professor.alunos.length - 1]
                                .vencimento)
                          }
                          onClick={() => {
                            setShouldFocus(true);
                            handleAddAluno(professor.id);
                          }}
                        >
                          Adicionar aluno
                        </StyledButton>
                      </ButtonBox>
                      <div>
                        <MoneyBox>
                          Bruto: R$
                          <h4>
                            {professor.alunos
                              .reduce((acc, cur) => {
                                return cur.ativo ? acc + cur.valor : acc;
                              }, 0)
                              .toFixed(2)
                              .replace(".", ",")}
                          </h4>
                        </MoneyBox>
                        <MoneyBox>
                          Comissão: R$
                          <h4>
                            {(
                              professor.alunos.reduce((acc, cur) => {
                                return cur.ativo ? acc + cur.valor : acc;
                              }, 0) *
                              (professor.percentual / 100)
                            )
                              .toFixed(2)
                              .replace(".", ",")}
                          </h4>
                        </MoneyBox>
                        <MoneyBox>
                          Líquido: R$
                          <h4>
                            {(
                              professor.alunos.reduce((acc, cur) => {
                                return cur.ativo ? acc + cur.valor : acc;
                              }, 0) -
                              professor.alunos.reduce((acc, cur) => {
                                return cur.ativo ? acc + cur.valor : acc;
                              }, 0) *
                                (professor.percentual / 100)
                            )
                              .toFixed(2)
                              .replace(".", ",")}
                          </h4>
                        </MoneyBox>
                      </div>
                    </ContainerBox>
                  );
                } else {
                  return "";
                }
              })}
            </div>
          </div>{" "}
        </>
      )}
      <div
        style={{
          display: "flex",
          margin: "0 auto",
          justifyContent: "center",
          height: "100vh",
          alignItems: "center",
        }}
      >
        {professores.length === 0 && (
          <div
            style={{ gap: "20px", display: "flex", flexDirection: "column" }}
          >
            <StyledButton
              onClick={handleAddProfessor}
              disabled={
                professores.length > 0 &&
                !professores[professores.length - 1].name
              }
            >
              <IoPersonAddSharp />
            </StyledButton>
            <UploadBox >
              <UploadInput type="file" onChange={(e) => handleUploadFile(e)} />
            </UploadBox>
          </div>
        )}
      </div>
    </>
  );
}

export default App;

const Name = styled.h4``;

const AlunosContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 1rem;
`;

const AlunosBox = styled.div`
  display: flex;
  gap: 4px;
`;

const MoneyBox = styled.div`
  display: flex;
  gap: 5px;
`;

const ButtonBox = styled.div`
  display: flex;
  margin: 1rem 0;
  padding-left: 14rem;
`;

const ProfSelectBox = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
`;

const TotalValuesBox = styled.h4`
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ContainerBox = styled.div`
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  gap: 8px;
  display: flex;
  flex-direction: column;
  border: 4px solid #37aee2;
`;

const StyledButton = styled.button`
  background-image: linear-gradient(-180deg, #37aee2 0%, #1e96c8 100%);
  border-radius: 0.5rem;
  color: #fff;
  display: flex;
  justify-content: center;
  padding: 5px;
  width: 100%;
  max-width: 120px;
  text-decoration: none;
  border: 0;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  &:hover {
    background-image: linear-gradient(-180deg, #1d95c9 0%, #17759c 100%);
  }
`;

const DeleteIcon = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;

  & > div {
    cursor: pointer;
    color: red;
    padding: 4px;
  }
`;

const UploadInput = styled.input`
  color: transparent;
  width: 90px;
`;

const UploadBox = styled.div`




`