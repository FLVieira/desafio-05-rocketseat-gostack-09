import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';

import api from '../../services/api';
import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  Button,
  IssuesFilter,
  PrevButton,
  NextButton,
} from './styles';

export default class Repository extends React.Component {
  state = {
    repository: {},
    issues: [],
    issuesFilter: '',
    loading: true,
    issuesPage: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const repository = await api.get(`/repos/${repoName}`);
    this.setState({
      repository: repository.data,
      loading: false,
    });
    this.loadIssues(1);
  }

  loadIssues = async (pageNumber) => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    // Paginating Issues
    const newIssues = await api.get(
      `/repos/${repoName}/issues?page=${pageNumber}`,
      {
        params: {
          // Passando alguns query params
          state: 'all',
          per_page: 30,
        },
      }
    );
    this.setState({ issues: [...newIssues.data] });
  };

  prevPage = (e) => {
    e.preventDefault();
    const { issuesPage } = this.state;
    if (issuesPage === 1) return;
    const pageNumber = issuesPage - 1;
    this.setState({ issuesPage: pageNumber });
    this.loadIssues(pageNumber);
  };

  nextPage = (e) => {
    e.preventDefault();
    const { issuesPage } = this.state;
    const pageNumber = issuesPage + 1;
    this.setState({ issuesPage: pageNumber });
    this.loadIssues(pageNumber);
  };

  handleFilteringCLick = (e, filter) => {
    e.preventDefault();
    this.setState({
      issuesFilter: filter,
    });
  };

  render() {
    const {
      repository,
      issues,
      issuesFilter,
      loading,
      issuesPage,
    } = this.state;

    // Filtering Issues
    let filteredIssues = issues;
    console.log(issues);
    if (issuesFilter === 'open') {
      filteredIssues = issues.filter((issue) => issue.state === 'open');
    } else if (issuesFilter === 'closed') {
      filteredIssues = issues.filter((issue) => issue.state === 'closed');
    }

    if (loading) {
      return <Loading>Carregando...</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssuesFilter>
          <Button onClick={(e) => this.handleFilteringCLick(e, 'all')}>
            Todas
          </Button>
          <Button onClick={(e) => this.handleFilteringCLick(e, 'open')}>
            Abertas
          </Button>
          <Button onClick={(e) => this.handleFilteringCLick(e, 'closed')}>
            Fechadas
          </Button>
        </IssuesFilter>

        <PrevButton
          style={{ opacity: issuesPage === 1 ? 0.7 : null }}
          onClick={this.prevPage}
        >
          <FaArrowAltCircleLeft />
        </PrevButton>
        <NextButton onClick={this.nextPage}>
          <FaArrowAltCircleRight />
        </NextButton>

        <IssueList>
          {filteredIssues.map((issue) => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map((label) => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};
